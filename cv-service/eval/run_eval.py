import argparse
import json
import sys
from pathlib import Path

import cv2

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from main import analyze_decoded_image


def parse_args():
    parser = argparse.ArgumentParser(description="Evaluate parking CV detections against labeled rectangles.")
    parser.add_argument("--images", default="eval/images", help="Directory containing evaluation images.")
    parser.add_argument("--labels", default="eval/labels", help="Directory containing JSON labels.")
    parser.add_argument("--iou-threshold", type=float, default=0.5, help="IoU threshold for success-rate reporting.")
    return parser.parse_args()


def iou(a, b):
    ax1, ay1 = a["x"], a["y"]
    ax2, ay2 = ax1 + a["width"], ay1 + a["height"]
    bx1, by1 = b["x"], b["y"]
    bx2, by2 = bx1 + b["width"], by1 + b["height"]

    inter_w = max(0, min(ax2, bx2) - max(ax1, bx1))
    inter_h = max(0, min(ay2, by2) - max(ay1, by1))
    inter = inter_w * inter_h
    union = a["width"] * a["height"] + b["width"] * b["height"] - inter
    return inter / union if union else 0.0


def format_pct(value):
    return f"{value * 100:.2f}%"


def main():
    args = parse_args()
    image_dir = Path(args.images)
    label_dir = Path(args.labels)

    if not image_dir.exists():
        raise SystemExit(f"Image directory not found: {image_dir}")
    if not label_dir.exists():
        raise SystemExit(f"Label directory not found: {label_dir}")

    image_paths = sorted(
        path
        for path in image_dir.iterdir()
        if path.is_file() and path.suffix.lower() in {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
    )

    if not image_paths:
        raise SystemExit("No evaluation images found.")

    evaluated = 0
    fallback_count = 0
    ious = []
    success_count = 0
    confidence_sum = 0.0
    confidence_count = 0

    for image_path in image_paths:
        label_path = label_dir / f"{image_path.stem}.json"
        if not label_path.exists():
            print(f"Skipping {image_path.name}: missing label {label_path.name}")
            continue

        with label_path.open("r", encoding="utf-8") as fh:
            label = json.load(fh)

        truth = label.get("rect")
        if not truth:
            print(f"Skipping {image_path.name}: label missing rect")
            continue

        img = cv2.imread(str(image_path))
        result = analyze_decoded_image(img)
        if result.get("error"):
            print(f"Skipping {image_path.name}: decode/analyze error")
            continue

        evaluated += 1
        fallback = bool(result.get("fallback"))
        if fallback:
            fallback_count += 1

        predicted = result["rect"]
        score = iou(predicted, truth)
        ious.append(score)

        if score >= args.iou_threshold:
            success_count += 1

        if not fallback and isinstance(result.get("confidence"), (int, float)):
            confidence_sum += float(result["confidence"])
            confidence_count += 1

        print(
            f"{image_path.name}: iou={score:.4f} "
            f"confidence={result.get('confidence', 0):.2f} fallback={fallback}"
        )

    if evaluated == 0:
        raise SystemExit("No labeled images were evaluated.")

    mean_iou = sum(ious) / len(ious)
    fallback_rate = fallback_count / evaluated
    success_rate = success_count / evaluated
    mean_confidence = (confidence_sum / confidence_count) if confidence_count else 0.0

    print()
    print("Evaluation summary")
    print(f"Images found: {len(image_paths)}")
    print(f"Images evaluated: {evaluated}")
    print(f"Fallback count: {fallback_count}")
    print(f"Fallback frequency: {format_pct(fallback_rate)}")
    print(f"Mean IoU: {mean_iou:.4f}")
    print(f"Success rate @ IoU >= {args.iou_threshold:.2f}: {format_pct(success_rate)}")
    print(f"Mean confidence on non-fallback detections: {mean_confidence:.4f}")


if __name__ == "__main__":
    main()
