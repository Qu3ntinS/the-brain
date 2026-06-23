#!/usr/bin/env python3
"""Export brain-logo.png from green-screen source (full-logo-chroma.png)."""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/assets/logo/full-logo-chroma.png"
PNG_OUT = ROOT / "public/assets/brain-logo.png"
SIZE = 512

# Typical flat green from border sampling (~#0BD006)
KEY_RGB = np.array([9.0, 209.0, 8.0], dtype=np.float32)
GREENNESS_HI = 95.0
GREENNESS_LO = 35.0
DIST_HARD = 18.0
DIST_SOFT = 35.0


def key_green_bg(img: Image.Image) -> Image.Image:
    arr = np.array(img.convert("RGBA"), dtype=np.float32)
    r, g, b, a = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]
    max_rb = np.maximum(r, b)
    greenness = g - max_rb

    alpha_from_greenness = np.clip(
        (GREENNESS_HI - greenness) / (GREENNESS_HI - GREENNESS_LO),
        0.0,
        1.0,
    )
    dist = np.linalg.norm(arr[..., :3] - KEY_RGB, axis=-1)
    alpha_from_dist = np.clip((dist - DIST_HARD) / DIST_SOFT, 0.0, 1.0)
    factor = np.minimum(alpha_from_greenness, alpha_from_dist)
    new_alpha = a * factor

    spill = np.clip(g - max_rb, 0.0, None)
    spill_mask = (new_alpha > 8) & (spill > 2)
    arr[..., 1] = np.where(spill_mask, g - spill * 0.92, g)
    arr[..., 3] = np.clip(new_alpha, 0, 255)

    return Image.fromarray(arr.astype(np.uint8), "RGBA")


def fit_logo(img: Image.Image) -> Image.Image:
    bbox = img.getchannel("A").getbbox()
    if not bbox:
        return img.resize((SIZE, SIZE), Image.Resampling.LANCZOS)

    crop = img.crop(bbox)
    canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    scale = min(SIZE / crop.width, SIZE / crop.height) * 0.94
    new_w = max(1, int(crop.width * scale))
    new_h = max(1, int(crop.height * scale))
    resized = crop.resize((new_w, new_h), Image.Resampling.LANCZOS)
    canvas.paste(
        resized,
        ((SIZE - new_w) // 2, (SIZE - new_h) // 2),
        resized,
    )
    return canvas


def main() -> int:
    if not SOURCE.exists():
        print(f"Missing {SOURCE}", file=sys.stderr)
        return 1

    PNG_OUT.parent.mkdir(parents=True, exist_ok=True)
    logo = fit_logo(key_green_bg(Image.open(SOURCE)))
    logo.save(PNG_OUT, optimize=True)
    print(
        f"✓ full-logo-chroma.png → brain-logo.png "
        f"({PNG_OUT.stat().st_size // 1024}KB)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
