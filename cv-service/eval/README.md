# Parking CV Evaluation

This folder is the evaluation scaffold for the parking CV pipeline.

## Goal

Measure real detection quality using labeled parking images instead of relying on heuristic confidence alone.

Recommended minimum dataset:

- `50` to `100` real parking photos
- varied lighting
- varied camera angles
- clean and noisy scenes

## Folder Layout

- `images/`
- `labels/`
- `run_eval.py`
- `sample_label.json`

## Label Format

Each image should have a matching JSON label file in `labels/`.

Example:

```json
{
  "rect": {
    "x": 120,
    "y": 80,
    "width": 340,
    "height": 210
  }
}
```

The rectangle should describe the intended ground-truth parking region in original image coordinates.

## Running

From `cv-service`:

```bash
python eval/run_eval.py
```

Optional arguments:

```bash
python eval/run_eval.py --images eval/images --labels eval/labels --iou-threshold 0.5
```

## Reported Metrics

The script reports:

- image count
- evaluated count
- fallback count
- fallback frequency
- mean IoU
- success rate at the chosen IoU threshold
- mean confidence on successful detections

## Notes

- This scaffold evaluates the current axis-aligned `rect` response.
- If the project later moves to polygon or rotated-box evaluation, this script should be extended accordingly.
