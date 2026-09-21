from __future__ import annotations

import io
import json
from pathlib import Path

from PIL import Image, ImageOps


SITE_ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = SITE_ROOT.parent / "包装设计"
OUTPUT_ROOT = SITE_ROOT / "works" / "packaging-library"
DATA_FILE = SITE_ROOT / "assets" / "packaging-library-data.js"
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def group_for(path: Path) -> tuple[str, str, int]:
    parts = path.relative_to(SOURCE_ROOT).parts
    if "优先展示" in parts:
        return "food", "食品包装 · 优先展示", 0
    if parts[0] == "食品包装设计":
        return "food", "食品包装", 1
    if "竹缎高端纸品系列" in parts:
        return "paper", "竹缎纸品系列", 2
    if parts[0] == "纸品包装设计":
        return "paper", "纸品包装", 3
    if parts[0].startswith("文创礼盒"):
        return "gift", "文创礼盒", 4
    return "all", "包装设计", 9


def ordered_sources() -> list[Path]:
    images = [
        path
        for path in SOURCE_ROOT.rglob("*")
        if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS
    ]
    return sorted(
        images,
        key=lambda path: (
            group_for(path)[2],
            str(path.relative_to(SOURCE_ROOT)).casefold(),
        ),
    )


def encoded_webp(image: Image.Image, target_bytes: int, long_image: bool) -> bytes:
    max_edge = 3600 if long_image else 2400
    if max(image.size) > max_edge:
        scale = max_edge / max(image.size)
        image = image.resize(
            (max(1, round(image.width * scale)), max(1, round(image.height * scale))),
            Image.Resampling.LANCZOS,
        )

    for quality in (82, 76, 70, 64, 58, 52, 46):
        buffer = io.BytesIO()
        image.save(buffer, "WEBP", quality=quality, method=6)
        payload = buffer.getvalue()
        if len(payload) <= target_bytes:
            return payload

    while len(payload) > target_bytes and max(image.size) > 1200:
        image = image.resize(
            (max(1, round(image.width * 0.88)), max(1, round(image.height * 0.88))),
            Image.Resampling.LANCZOS,
        )
        buffer = io.BytesIO()
        image.save(buffer, "WEBP", quality=52, method=6)
        payload = buffer.getvalue()
    return payload


def main() -> None:
    Image.MAX_IMAGE_PIXELS = None
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    sources = ordered_sources()
    manifest: list[dict[str, object]] = []

    for index, source in enumerate(sources, start=1):
        category, collection, _ = group_for(source)
        with Image.open(source) as opened:
            image = ImageOps.exif_transpose(opened)
            if image.mode not in {"RGB", "RGBA"}:
                image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
            width, height = image.size
            ratio = max(width, height) / max(1, min(width, height))
            long_image = ratio >= 2.2
            target_bytes = 1_000_000 if long_image else 500_000
            payload = encoded_webp(image, target_bytes, long_image)

        filename = f"{index:03d}.webp"
        (OUTPUT_ROOT / filename).write_bytes(payload)
        manifest.append(
            {
                "src": f"/works/packaging-library/{filename}",
                "category": category,
                "collection": collection,
                "title": source.stem,
                "width": width,
                "height": height,
            }
        )

    DATA_FILE.write_text(
        "export const packagingItems = "
        + json.dumps(manifest, ensure_ascii=False, separators=(",", ":"))
        + ";\n",
        encoding="utf-8",
    )
    total_bytes = sum((OUTPUT_ROOT / f"{index:03d}.webp").stat().st_size for index in range(1, len(sources) + 1))
    print(f"Converted {len(sources)} images to {total_bytes / 1024 / 1024:.1f} MB")


if __name__ == "__main__":
    main()
