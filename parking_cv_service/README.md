# Parking CV Measurement Microservice

This service improves parking spot measurement precision and reliability via:

- CLAHE-based contrast enhancement for variable lighting.
- Bilateral denoising to preserve edges.
- Canny + morphological close for stable boundary extraction.
- Contour ranking + quadrilateral/min-area-rect fallback for robust corner detection.
- Confidence scoring and structured debug output for real-time diagnostics.

## Full technical documentation

See [`OPENCV_PARKING_MEASUREMENT.md`](./OPENCV_PARKING_MEASUREMENT.md) for a complete module-by-module architecture and pipeline document.

## Run

```bash
cd parking_cv_service
pip install -r requirements.txt
uvicorn app:app --reload --port 8080
```

## API

### `GET /health`
Simple health check.

### `POST /measure`
Request body:

```json
{
  "image_base64": "<base64-image>",
  "pixel_to_cm": 0.21
}
```

Response contains width/height in cm, ordered corners, confidence, and debug fields.
