# OpenCV Parking Measurement: Complete Technical Documentation

## 1) Purpose

The `parking_cv_service` is a Python FastAPI microservice that measures parking spot dimensions from an input image.

Its primary goals are:

- high precision corner and boundary detection,
- reliable width/height estimation,
- predictable API behavior for real-time systems,
- inspectable debug metadata for operational troubleshooting.

---

## 2) Service Overview

### Runtime stack

- **API framework**: FastAPI
- **Computer vision**: OpenCV (`opencv-python-headless`)
- **Math/array ops**: NumPy
- **Validation models**: Pydantic
- **Server**: Uvicorn

### Endpoints

- `GET /health`
  - Basic liveness check.
- `POST /measure`
  - Accepts a base64 image + pixel-to-cm ratio.
  - Returns measured width/height, detected corners, confidence, and debug information.

---

## 3) Module Inventory (What it has)

The implementation currently lives in `app.py` and contains the following modules/components:

1. **Data contracts**
   - `DetectionResult` (internal dataclass)
   - `MeasureRequest` (input model)
   - `MeasureResponse` (output model)

2. **Input module**
   - `decode_image(image_base64)`
   - Converts base64 payload -> decoded OpenCV image.

3. **Geometry utility module**
   - `order_points(points)`
   - Normalizes corner order to: top-left, top-right, bottom-right, bottom-left.

4. **Preprocessing module**
   - `adaptive_preprocess(image)`
   - Applies grayscale, CLAHE, bilateral denoise, Canny edges, morphology-close.

5. **Contour ranking module**
   - `contour_score(contour, area)`
   - Scores candidates by area + polygon quality + solidity.

6. **Spot detection module**
   - `detect_spot_polygon(image)`
   - Finds and filters contours, picks best candidate, resolves corners using
     quadrilateral approximation or min-area rectangle fallback.

7. **API handlers**
   - `health()`
   - `measure_spot(payload)`

---

## 4) Full Processing Pipeline

### Step A: Decode request image

- Input arrives as base64 string.
- Decode to bytes.
- Convert bytes -> NumPy array.
- Decode into BGR image (`cv2.imdecode`).

Failure behavior:
- malformed base64 or invalid image -> HTTP 400.

### Step B: Adaptive preprocessing (accuracy and reliability improvements)

`adaptive_preprocess(image)` performs:

1. **Grayscale conversion**
   - reduces channels and noise sensitivity for edge extraction.

2. **CLAHE (Contrast Limited Adaptive Histogram Equalization)**
   - improves local contrast under uneven lighting.
   - helps boundary visibility in shadowed or overexposed areas.

3. **Bilateral filtering**
   - denoises while preserving edges.
   - superior to simple blur for contour extraction.

4. **Canny edge detection**
   - obtains strong boundary gradients.

5. **Morphological closing**
   - bridges broken edges and closes small gaps for stable contour formation.

Debug emitted:
- mean grayscale value,
- count of non-zero edge pixels.

### Step C: Contour extraction and filtering

- external contours retrieved from edge map.
- very small contours (`area < 2500`) are filtered as noise.

If no valid candidate remains:
- HTTP 422 with "contours filtered as noise".

### Step D: Candidate ranking

`contour_score` combines:

- **Area contribution** (larger structural candidates preferred),
- **Polygon bonus** (4-corner geometry favored),
- **Solidity term** (`area / boundingRectArea`) to reject irregular/noisy shapes.

Top-scoring contour is selected for measurement.

### Step E: Corner extraction

From best contour:

- Use `approxPolyDP` for polygon approximation.
- If approximation has exactly 4 points -> use as corners.
- If >4 points -> convex hull then `minAreaRect` to derive 4 corners.
- If <4 points -> fallback directly to `minAreaRect`.

This fallback strategy significantly improves reliability when edges are imperfect.

### Step F: Corner ordering and measurement

`order_points` produces deterministic order:

1. top-left
2. top-right
3. bottom-right
4. bottom-left

Pixel dimensions:

- width_px = distance(top-left, top-right)
- height_px = distance(top-right, bottom-right)

Then convert using provided scale:

- width_cm = width_px * pixel_to_cm
- height_cm = height_px * pixel_to_cm

### Step G: Confidence and response

Confidence uses candidate area ratio with clamping to `[0.35, 0.99]`.

Response includes:

- `width_cm`, `height_cm`
- ordered `corners_px`
- `confidence`
- `debug` block with pixel dimensions + processing signature

---

## 5) API Contract

### POST `/measure`

#### Request

```json
{
  "image_base64": "<base64 encoded image>",
  "pixel_to_cm": 0.21
}
```

Rules:

- `pixel_to_cm` must be > 0.
- Image must decode successfully.

#### Success response (example)

```json
{
  "width_cm": 248.93,
  "height_cm": 503.16,
  "corners_px": [[100.2, 80.1], [340.4, 82.7], [342.2, 560.1], [98.7, 558.8]],
  "confidence": 0.873,
  "debug": {
    "width_px": 1185.4,
    "height_px": 2396.0,
    "processing": "clahe + bilateral + canny + morphology + contour ranking"
  }
}
```

#### Error behavior

- `400`: invalid payload / image decode failure.
- `422`: no usable parking spot contour detected.

---

## 6) Precision Considerations

Accuracy depends on:

1. **Calibration quality** (`pixel_to_cm`)
   - Incorrect scale causes proportional output error.

2. **Camera perspective**
   - Strong oblique angles can distort dimensions.

3. **Occlusions / artifacts**
   - vehicles, shadows, paint wear, reflections may degrade contour quality.

4. **Image resolution**
   - low-res input reduces corner localization accuracy.

Best practices:

- use calibrated camera or known reference scaling,
- keep camera angle consistent,
- prefer high-resolution frames,
- periodically validate against manually measured spots.

---

## 7) Reliability Strategies Implemented

- deterministic corner ordering for stable downstream geometry,
- contour scoring instead of first-match selection,
- multi-path corner derivation fallback (`approxPolyDP` + `minAreaRect`),
- typed request/response schemas,
- clear HTTP status-based failure modes,
- diagnostic debug fields for production observability.

---

## 8) Real-time Processing Notes

Current code is single-image request/response and suitable for microservice deployment.

For higher throughput:

- batch frame inference workers,
- image pre-resize strategy with calibrated scale compensation,
- async queue + worker pattern,
- metrics: p95 latency, contour failure rate, confidence distribution.

---

## 9) Extension Modules You Can Add Next

1. **Perspective correction module**
   - rectify to top-down plane before measurement.

2. **Reference object auto-calibration**
   - detect known fiducial marker for dynamic `pixel_to_cm`.

3. **Multi-spot detection**
   - return array of parking spots with per-spot measurements.

4. **Model-assisted boundary detection**
   - combine segmentation model + geometric post-processing.

5. **Temporal smoothing**
   - stabilize corners across video frames.

---

## 10) File Map

- `parking_cv_service/app.py` -> full API + CV pipeline implementation
- `parking_cv_service/requirements.txt` -> dependencies
- `parking_cv_service/README.md` -> run and API quickstart
- `parking_cv_service/OPENCV_PARKING_MEASUREMENT.md` -> this full technical spec

---

## 11) Quick Start

```bash
cd parking_cv_service
pip install -r requirements.txt
uvicorn app:app --reload --port 8080
```

Test:

```bash
curl http://127.0.0.1:8080/health
```

---

## 12) Summary

This OpenCV parking measurement service now provides a robust, inspectable, and extensible measurement stack with improved boundary/corner detection reliability and consistent dimension output for parking spot analysis workflows.
