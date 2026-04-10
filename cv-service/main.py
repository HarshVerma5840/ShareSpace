from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np

PROC_WIDTH = 640
MIN_AREA_RATIO = 0.05
MAX_AREA_RATIO = 0.95
MIN_CONFIDENCE = 0.45
IDEAL_ASPECT = 2.5

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def build_fallback_response(img_shape):
    height, width = img_shape[:2]
    rect = {
        "x": int(width * 0.25),
        "y": int(height * 0.25),
        "width": int(width * 0.5),
        "height": int(height * 0.5),
    }
    return {
        "rect": rect,
        "areaPx": int(rect["width"] * rect["height"]),
        "confidence": 0.0,
        "fallback": True,
        "rotatedRect": None,
    }


def resize_for_processing(img):
    height, width = img.shape[:2]
    if width <= PROC_WIDTH:
        return img, 1.0

    scale = PROC_WIDTH / float(width)
    resized = cv2.resize(img, (PROC_WIDTH, max(1, int(height * scale))), interpolation=cv2.INTER_AREA)
    return resized, scale


def compute_adaptive_edges(blurred):
    otsu_val, _ = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    high = max(float(otsu_val), 30.0)
    low = max(high * 0.5, 10.0)
    return cv2.Canny(blurred, low, high)


def contour_metrics(contour):
    x, y, w, h = cv2.boundingRect(contour)
    contour_area = cv2.contourArea(contour)
    hull = cv2.convexHull(contour)
    hull_area = cv2.contourArea(hull)
    rect_area = float(w * h)
    aspect = (w / h) if h > 0 else 0.0
    solidity = (contour_area / hull_area) if hull_area > 0 else 0.0
    fill_ratio = (contour_area / rect_area) if rect_area > 0 else 0.0
    return {
        "contour": contour,
        "rect": (x, y, w, h),
        "contour_area": contour_area,
        "aspect": aspect,
        "solidity": solidity,
        "fill_ratio": fill_ratio,
    }


def is_parking_candidate(metrics):
    return 1.2 <= metrics["aspect"] <= 6.5 and metrics["solidity"] >= 0.7 and metrics["fill_ratio"] >= 0.45


def aspect_score(aspect):
    if aspect <= 0:
        return 0.0
    return max(0.0, 1.0 - min(abs(aspect - IDEAL_ASPECT) / IDEAL_ASPECT, 1.0))


def scale_rect(rect, scale):
    if scale == 1.0:
        x, y, w, h = rect
        return int(x), int(y), int(w), int(h)

    inv_scale = 1.0 / scale
    x, y, w, h = rect
    return (
        int(round(x * inv_scale)),
        int(round(y * inv_scale)),
        int(round(w * inv_scale)),
        int(round(h * inv_scale)),
    )


def scale_points(points, scale):
    if scale == 1.0:
        return [[float(point[0]), float(point[1])] for point in points]

    inv_scale = 1.0 / scale
    return [[float(point[0] * inv_scale), float(point[1] * inv_scale)] for point in points]


def build_rotated_rect(contour, scale):
    rot_rect = cv2.minAreaRect(contour)
    (cx, cy), (rw, rh), angle = rot_rect
    box_points = cv2.boxPoints(rot_rect)
    scaled_points = scale_points(box_points, scale)
    if scale != 1.0:
        inv_scale = 1.0 / scale
        cx *= inv_scale
        cy *= inv_scale
        rw *= inv_scale
        rh *= inv_scale

    return {
        "center": [round(float(cx), 2), round(float(cy), 2)],
        "size": [round(float(rw), 2), round(float(rh), 2)],
        "angle": round(float(angle), 2),
        "points": [[round(point[0], 2), round(point[1], 2)] for point in scaled_points],
    }


def analyze_decoded_image(img):
    if img is None:
        return {"error": "Invalid image"}

    proc_img, scale = resize_for_processing(img)

    # Convert to grayscale
    gray = cv2.cvtColor(proc_img, cv2.COLOR_BGR2GRAY)

    # Gaussian blur to reduce noise
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    # Edge detection
    edges = compute_adaptive_edges(blurred)

    # Find contours
    contours, _ = cv2.findContours(edges.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not contours:
        return build_fallback_response(img.shape)

    metrics_by_contour = [contour_metrics(contour) for contour in contours]
    candidates = [metrics for metrics in metrics_by_contour if is_parking_candidate(metrics)]

    if not candidates:
        return build_fallback_response(img.shape)

    chosen = max(
        candidates,
        key=lambda metrics: (
            metrics["contour_area"],
            metrics["solidity"],
            metrics["fill_ratio"],
        ),
    )

    x, y, w, h = scale_rect(chosen["rect"], scale)
    rotated_rect = build_rotated_rect(chosen["contour"], scale)

    # If the detected region is too small or too large, provide a default fallback.
    img_area = img.shape[0] * img.shape[1]
    rect_area = w * h
    if rect_area < (img_area * MIN_AREA_RATIO) or rect_area > (img_area * MAX_AREA_RATIO):
        return build_fallback_response(img.shape)

    confidence = round(
        min(
            1.0,
            0.4 * chosen["solidity"] + 0.3 * chosen["fill_ratio"] + 0.3 * aspect_score(chosen["aspect"]),
        ),
        2,
    )
    if confidence < MIN_CONFIDENCE:
        return build_fallback_response(img.shape)

    rotated_area = rotated_rect["size"][0] * rotated_rect["size"][1]
    return {
        "rect": {"x": int(x), "y": int(y), "width": int(w), "height": int(h)},
        "rotatedRect": rotated_rect,
        "areaPx": int(round(rotated_area)),
        "confidence": confidence,
        "fallback": False,
    }


@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return analyze_decoded_image(img)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
