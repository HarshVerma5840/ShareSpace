# Current Parking CV Documentation

## Scope

This document describes the current parking computer-vision system implemented in this repository as of April 9, 2026.

It covers:

- the backend OpenCV pipeline
- the frontend scanner flow
- all functional modules in the current implementation
- the exact API response contract
- the current confidence and fallback logic
- the strict truth about real accuracy

Primary files:

- `cv-service/main.py`
- `cv-service/requirements.txt`
- `src/SpotScanner.jsx`

## Strict Accuracy Statement

The current system does not have a validated real-world accuracy percentage.

That means:

- there is no benchmark dataset in this repo
- there is no ground-truth annotation set
- there is no measured IoU, precision, recall, MAE, or success-rate report
- there is no calibrated conversion from pixels to meters or feet

Because of that, any claim like "92% accurate" or "strict real accuracy = 87%" would be fabricated.

The system currently provides:

- a rectangle estimate in image pixels
- a rotated rectangle estimate in image pixels
- a heuristic `confidence` score from `0.0` to `1.0`
- a `fallback` flag when detection is considered unreliable

Important:

- `confidence` is not a real accuracy percentage
- `confidence` is only an internal quality heuristic derived from contour shape
- it should not be reported as measured accuracy

Strictly correct accuracy status:

- Real measured accuracy percentage: unknown
- Real benchmarked production accuracy percentage: not established
- Pixel-space estimate availability: yes
- Manual correction support: yes

## What The System Actually Does

The current parking CV system estimates a likely parking-spot rectangle from a captured image and returns:

- `rect`
- `rotatedRect`
- `areaPx`
- `confidence`
- `fallback`

The response includes both:

- an axis-aligned rectangle for existing UI compatibility
- a rotated rectangle for more accurate geometry when the spot is angled

The estimated area is in square pixels, not real-world units.

The intended workflow is:

1. Capture a parking image from the frontend.
2. Send the image to the Python backend.
3. Let OpenCV estimate a rectangular parking region.
4. Show that region on the frontend.
5. Let the user manually correct the result if needed.

## Architecture

The feature has two layers:

1. Frontend capture and adjustment layer
2. Backend OpenCV analysis layer

End-to-end flow:

1. The user opens the camera in the browser.
2. The frontend captures a frame to a hidden canvas.
3. The canvas is converted to a JPEG blob.
4. The blob is uploaded to `POST /analyze`.
5. The backend decodes and processes the image.
6. The backend returns a rectangle, area, confidence, and fallback flag.
7. The frontend overlays the rectangle on the captured image.
8. The user can drag the box corners to refine the region manually.

## Module Inventory

### Backend Runtime Module

File: `cv-service/main.py`

Contains:

- FastAPI app setup
- CORS configuration
- image upload handling
- image decode logic
- preprocessing
- adaptive Canny edge detection
- contour extraction
- contour scoring and parking-like filtering
- rotated rectangle extraction
- rectangle scaling back to original resolution
- confidence scoring
- fallback response generation
- API response serialization

### Dependency Module

File: `cv-service/requirements.txt`

Dependencies:

- `fastapi`
- `uvicorn`
- `opencv-python-headless`
- `numpy`
- `python-multipart`

### Frontend Scanner Module

File: `src/SpotScanner.jsx`

Contains:

- camera access
- frame capture
- upload to backend
- rectangle overlay
- manual handle dragging
- area update callback
- confidence/fallback message display

## Backend Constants

The current backend uses these fixed control values:

- `PROC_WIDTH = 640`
- `MIN_AREA_RATIO = 0.05`
- `MAX_AREA_RATIO = 0.95`
- `MIN_CONFIDENCE = 0.45`

Meaning:

- processing is downscaled to width `640` when the image is larger
- detections smaller than `5%` of the image are rejected
- detections larger than `95%` of the image are rejected
- detections with confidence below `0.45` are rejected

## Backend Functions

### 1. `build_fallback_response(img_shape)`

Purpose:

- returns a centered default rectangle when detection fails or is rejected

Current fallback response:

- centered at `25%` margin from top-left
- width = `50%` of image width
- height = `50%` of image height
- `confidence = 0.0`
- `fallback = True`
- `rotatedRect = null`

### 2. `resize_for_processing(img)`

Purpose:

- improves speed on high-resolution images

Behavior:

- if image width is `<= 640`, process as-is
- otherwise resize to width `640`
- preserve aspect ratio
- return both resized image and scale factor

Why this exists:

- large mobile photos are expensive to process at full resolution
- detection does not need the full original size
- final rectangle is scaled back afterward

### 3. `compute_adaptive_edges(blurred)`

Purpose:

- computes lighting-adaptive Canny thresholds

Current method:

1. Apply Otsu thresholding to estimate an intensity split point.
2. Use that value as the Canny high threshold.
3. Use half of that value as the low threshold.
4. Clamp to minimums to avoid useless near-zero thresholds.

Current logic:

- `high = max(otsu_val, 30.0)`
- `low = max(high * 0.5, 10.0)`

Why this is better than fixed thresholds:

- adapts to contrast differences between bright and dim scenes
- reduces dependence on one hardcoded lighting assumption

### 4. `contour_metrics(contour)`

Purpose:

- computes geometric properties for candidate filtering and scoring

Computed values:

- axis-aligned rectangle
- contour area
- convex hull area
- aspect ratio
- solidity
- fill ratio

Definitions:

- `aspect = w / h`
- `solidity = contour_area / hull_area`
- `fill_ratio = contour_area / rect_area`

### 5. `is_parking_candidate(metrics)`

Purpose:

- rejects contours that do not look sufficiently parking-slot-like

Current acceptance rules:

- `1.2 <= aspect <= 6.5`
- `solidity >= 0.7`
- `fill_ratio >= 0.45`

Interpretation:

- contour should be wider than tall, or at least not tall and narrow
- contour should be reasonably compact and not highly fragmented
- contour should occupy enough of its bounding rectangle

### 6. `scale_rect(rect, scale)`

Purpose:

- converts the detected rectangle from resized-image coordinates back into original-image coordinates

This preserves frontend compatibility even though processing happens on a smaller image.

### 7. `build_rotated_rect(contour, scale)`

Purpose:

- derives a rotated parking box from the selected contour using `cv2.minAreaRect`

Returned fields:

- `center`
- `size`
- `angle`
- `points`

This enables the API to return angle-aware geometry without breaking the existing axis-aligned overlay path.

### 8. `analyze_decoded_image(img)`

Purpose:

- centralizes the full CV analysis in a reusable function

This is used by:

- the FastAPI endpoint
- the evaluation script in `eval/run_eval.py`

## Full Processing Pipeline

### 1. Upload Read

The backend reads the uploaded image file bytes from the multipart request.

### 2. Byte Buffer Conversion

The raw bytes are converted into a NumPy `uint8` array.

### 3. OpenCV Decode

The NumPy buffer is decoded into a BGR image using:

- `cv2.imdecode(..., cv2.IMREAD_COLOR)`

If decoding fails:

- return `{"error": "Invalid image"}`

### 4. Resize For Processing

If the image is wider than `640` pixels:

- resize before running the CV pipeline

If not:

- keep the original resolution

### 5. Grayscale Conversion

The processing image is converted from BGR to grayscale.

### 6. Gaussian Blur

A `5 x 5` Gaussian blur is applied to reduce noise before edge detection.

### 7. Adaptive Edge Detection

The blurred grayscale image goes through:

- Otsu threshold estimation
- adaptive Canny edge detection

This replaces the previous fixed `50/150` thresholds.

### 8. Contour Extraction

Contours are detected from the edge map using:

- `cv2.RETR_EXTERNAL`
- `cv2.CHAIN_APPROX_SIMPLE`

This means:

- only outer contours are considered
- internal nested contours are ignored

### 9. No-Contour Fallback

If no contours are found:

- return fallback rectangle

### 10. Contour Metrics Generation

Each contour is converted into a metrics object containing:

- rectangle
- contour area
- aspect
- solidity
- fill ratio

### 11. Parking Candidate Filtering

Contours are filtered using the parking candidate rules.

If no contours pass the filter:

- the backend returns a fallback response immediately

This is intentional:

- it prevents the detector from silently reconsidering contours it already classified as poor candidates
- it makes the filter a real safety boundary rather than a soft suggestion

### 12. Best Candidate Selection

The chosen contour is the max candidate using this priority:

1. contour area
2. solidity
3. fill ratio

This means the backend prefers:

- large contours first
- then more compact, solid shapes
- then contours that occupy their bounding box better

### 13. Rectangle Rescaling

The chosen rectangle is scaled back from processing coordinates to original image coordinates.

### 14. Rotated Rectangle Extraction

After the winning contour is selected, the backend also computes:

- rotated center
- rotated size
- rotated angle
- four rotated corner points

This rotated geometry is returned in original image coordinates.

### 15. Area Sanity Validation

The final rectangle is rejected if:

- area `< 5%` of the full image
- area `> 95%` of the full image

Rejected result:

- fallback response

### 16. Confidence Scoring

Confidence is computed as:

- `0.4 * solidity + 0.3 * fill_ratio + 0.3 * aspect_score`

Then:

- clamped to maximum `1.0`
- rounded to 2 decimals

Where:

- `aspect_score` measures how close the detected aspect ratio is to the current ideal parking ratio of `2.5`

Important:

- this is a heuristic score
- this is not a measured probability
- this is not a benchmarked accuracy percentage

### 17. Confidence Rejection

If:

- `confidence < 0.45`

Then:

- fallback response is returned

### 18. Final Success Response

If the detection survives all checks, the backend returns:

```json
{
  "rect": {
    "x": 120,
    "y": 80,
    "width": 340,
    "height": 210
  },
  "rotatedRect": {
    "center": [290.5, 185.0],
    "size": [332.7, 205.4],
    "angle": 12.8,
    "points": [[109.4, 120.5], [434.6, 194.2], [471.6, 249.5], [146.4, 175.8]]
  },
  "areaPx": 68340,
  "confidence": 0.78,
  "fallback": false
}
```

## API Contract

### Endpoint

- `POST /analyze`

### Request

- `multipart/form-data`
- image file under field name `file`

### Success Response

```json
{
  "rect": {
    "x": 120,
    "y": 80,
    "width": 340,
    "height": 210
  },
  "rotatedRect": {
    "center": [290.5, 185.0],
    "size": [332.7, 205.4],
    "angle": 12.8,
    "points": [[109.4, 120.5], [434.6, 194.2], [471.6, 249.5], [146.4, 175.8]]
  },
  "areaPx": 68340,
  "confidence": 0.78,
  "fallback": false
}
```

### Fallback Response

```json
{
  "rect": {
    "x": 160,
    "y": 120,
    "width": 320,
    "height": 240
  },
  "rotatedRect": null,
  "areaPx": 76800,
  "confidence": 0.0,
  "fallback": true
}
```

### Invalid Image Response

```json
{
  "error": "Invalid image"
}
```

## Frontend Behavior

The frontend scanner in `src/SpotScanner.jsx` does the following:

1. opens the environment-facing camera
2. captures one frame to canvas
3. converts the frame into a JPEG blob
4. uploads it to the backend
5. stores `rect`
6. stores `confidence` and `fallback`
7. overlays the returned rectangle on the captured image
8. allows user drag adjustment through four corner handles
9. recomputes displayed area on manual resize

## What The Frontend Shows About Quality

The current UI displays:

- fallback warning if backend returned `fallback = true`
- low-confidence warning if `confidence < 0.6`
- confidence text if detection appears acceptable

This helps the user understand when manual correction is especially important.

## What The System Measures

Current measurable outputs:

- rectangle `x`
- rectangle `y`
- rectangle `width`
- rectangle `height`
- rotated rectangle center
- rotated rectangle size
- rotated rectangle angle
- rotated rectangle corner points
- rectangle area in square pixels

## What The System Does Not Measure

The current system does not provide:

- real-world width
- real-world height
- real-world area
- perspective-corrected measurements
- strict benchmarked accuracy percentage
- semantic parking-slot detection

## Current Accuracy Position

The most precise and honest current accuracy summary is:

- The system can produce a useful initial rectangle estimate in many ordinary capture conditions.
- The system cannot currently claim a strict real accuracy percentage.
- The returned `confidence` value is a contour-quality heuristic, not a benchmark result.
- Final usable accuracy depends partly on manual user correction in the UI.

If a strict real accuracy percentage is required, the project needs a proper evaluation pipeline:

1. collect a labeled dataset of parking images
2. define the target metric
3. compare predicted rectangle against ground truth
4. compute benchmark numbers

This repository now includes an evaluation scaffold under:

- `cv-service/eval/run_eval.py`
- `cv-service/eval/images/`
- `cv-service/eval/labels/`
- `cv-service/eval/sample_label.json`

Reasonable benchmark options:

- IoU accuracy against labeled boxes
- mean absolute area error
- success rate above an IoU threshold like `0.5` or `0.75`
- fallback frequency across the dataset

## Known Strengths

- simple architecture
- fast runtime due to pre-resize
- adaptive thresholds improve robustness over fixed thresholds
- contour filtering reduces false positives from obviously poor shapes
- fallback prevents hard failure
- manual correction makes the feature practical for user workflows

## Known Limitations

- no real-world calibration
- no homography or perspective correction
- still depends on contour visibility
- shadows, vehicles, glare, and worn paint can still mislead the detector
- confidence is heuristic only
- final quality still depends on user correction in difficult scenes

## Running The Backend

From `cv-service`:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

Expected endpoint:

- `http://localhost:8000/analyze`

## File Summary

- Backend implementation: `cv-service/main.py`
- Backend dependencies: `cv-service/requirements.txt`
- Frontend scanner: `src/SpotScanner.jsx`
- Evaluation scaffold: `cv-service/eval/run_eval.py`
