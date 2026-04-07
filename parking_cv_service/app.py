from __future__ import annotations

import base64
from dataclasses import dataclass
from typing import Any, Dict, List, Tuple

import cv2
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="Parking Spot Measurement Service", version="1.0.0")


@dataclass
class DetectionResult:
    corners_px: np.ndarray
    width_px: float
    height_px: float
    confidence: float


class MeasureRequest(BaseModel):
    image_base64: str = Field(..., description="Base64-encoded image bytes")
    pixel_to_cm: float = Field(..., gt=0, description="Centimeter-per-pixel conversion factor")


class MeasureResponse(BaseModel):
    width_cm: float
    height_cm: float
    corners_px: List[List[float]]
    confidence: float
    debug: Dict[str, Any]


def decode_image(image_base64: str) -> np.ndarray:
    try:
        raw = base64.b64decode(image_base64)
        img_np = np.frombuffer(raw, dtype=np.uint8)
        image = cv2.imdecode(img_np, cv2.IMREAD_COLOR)
        if image is None:
            raise ValueError("unable to decode image")
        return image
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid image payload: {exc}") from exc


def order_points(points: np.ndarray) -> np.ndarray:
    pts = points.reshape(4, 2).astype(np.float32)
    summation = pts.sum(axis=1)
    diff = np.diff(pts, axis=1)

    top_left = pts[np.argmin(summation)]
    bottom_right = pts[np.argmax(summation)]
    top_right = pts[np.argmin(diff)]
    bottom_left = pts[np.argmax(diff)]

    return np.array([top_left, top_right, bottom_right, bottom_left], dtype=np.float32)


def adaptive_preprocess(image: np.ndarray) -> Tuple[np.ndarray, Dict[str, float]]:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=2.4, tileGridSize=(8, 8))
    contrast = clahe.apply(gray)

    denoised = cv2.bilateralFilter(contrast, d=7, sigmaColor=45, sigmaSpace=45)
    edges = cv2.Canny(denoised, threshold1=65, threshold2=170)

    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    closed = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel, iterations=2)

    debug_stats = {
        "mean_gray": float(np.mean(gray)),
        "edge_pixels": float(np.count_nonzero(closed)),
    }
    return closed, debug_stats


def contour_score(contour: np.ndarray, area: float) -> float:
    peri = cv2.arcLength(contour, True)
    approx = cv2.approxPolyDP(contour, 0.02 * peri, True)
    polygon_bonus = 1.0 if len(approx) == 4 else 0.55

    x, y, w, h = cv2.boundingRect(contour)
    rect_area = max(w * h, 1)
    solidity = min(area / rect_area, 1.0)

    return (area * 0.0001) + (polygon_bonus * 0.6) + (solidity * 0.4)


def detect_spot_polygon(image: np.ndarray) -> DetectionResult:
    edge_map, debug_stats = adaptive_preprocess(image)
    contours, _ = cv2.findContours(edge_map, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not contours:
        raise HTTPException(status_code=422, detail="No valid parking spot contour found")

    ranked: List[Tuple[float, np.ndarray, float]] = []
    for contour in contours:
        area = cv2.contourArea(contour)
        if area < 2500:
            continue
        ranked.append((contour_score(contour, area), contour, area))

    if not ranked:
        raise HTTPException(status_code=422, detail="Contours found but all filtered as noise")

    ranked.sort(key=lambda item: item[0], reverse=True)
    best_contour = ranked[0][1]

    peri = cv2.arcLength(best_contour, True)
    approx = cv2.approxPolyDP(best_contour, 0.018 * peri, True)

    if len(approx) >= 4:
        if len(approx) > 4:
            hull = cv2.convexHull(approx)
            rect = cv2.minAreaRect(hull)
            corners = cv2.boxPoints(rect)
        else:
            corners = approx.reshape(4, 2)
    else:
        rect = cv2.minAreaRect(best_contour)
        corners = cv2.boxPoints(rect)

    ordered = order_points(corners)
    width_px = float(np.linalg.norm(ordered[0] - ordered[1]))
    height_px = float(np.linalg.norm(ordered[1] - ordered[2]))

    area = cv2.contourArea(best_contour)
    confidence = float(min(0.99, max(0.35, (area / (image.shape[0] * image.shape[1])) + 0.4)))
    debug_stats["selected_area"] = float(area)

    return DetectionResult(corners_px=ordered, width_px=width_px, height_px=height_px, confidence=confidence)


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/measure", response_model=MeasureResponse)
def measure_spot(payload: MeasureRequest) -> MeasureResponse:
    image = decode_image(payload.image_base64)
    result = detect_spot_polygon(image)

    width_cm = result.width_px * payload.pixel_to_cm
    height_cm = result.height_px * payload.pixel_to_cm

    return MeasureResponse(
        width_cm=round(width_cm, 2),
        height_cm=round(height_cm, 2),
        corners_px=result.corners_px.astype(float).tolist(),
        confidence=round(result.confidence, 3),
        debug={
            "width_px": round(result.width_px, 2),
            "height_px": round(result.height_px, 2),
            "processing": "clahe + bilateral + canny + morphology + contour ranking",
        },
    )
