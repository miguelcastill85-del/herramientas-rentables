#!/usr/bin/env python3
"""Deterministic SVG -> PNG export for SIGMA social assets.

Free/open-source dependency: CairoSVG.
No network access is required.
"""

from __future__ import annotations

import argparse
import hashlib
import struct
from pathlib import Path

import cairosvg

PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def png_dimensions(path: Path) -> tuple[int, int]:
    data = path.read_bytes()[:24]
    if len(data) < 24 or data[:8] != PNG_SIGNATURE or data[12:16] != b"IHDR":
        raise ValueError(f"not a valid PNG with IHDR: {path}")
    width, height = struct.unpack(">II", data[16:24])
    return width, height


def rasterize_one(svg: Path, png: Path, expected_width: int | None, expected_height: int | None) -> dict:
    if svg.suffix.lower() != ".svg":
        raise ValueError(f"input must be .svg: {svg}")
    if not svg.exists():
        raise FileNotFoundError(svg)

    png.parent.mkdir(parents=True, exist_ok=True)
    cairosvg.svg2png(url=str(svg), write_to=str(png))

    width, height = png_dimensions(png)
    if expected_width is not None and width != expected_width:
        raise ValueError(f"width mismatch for {png}: expected {expected_width}, got {width}")
    if expected_height is not None and height != expected_height:
        raise ValueError(f"height mismatch for {png}: expected {expected_height}, got {height}")

    return {
        "svg": str(svg),
        "png": str(png),
        "width": width,
        "height": height,
        "svg_sha256": sha256_file(svg),
        "png_sha256": sha256_file(png),
    }


def collect_svg_files(source: Path) -> list[Path]:
    if source.is_file():
        return [source]
    if not source.is_dir():
        raise FileNotFoundError(source)
    return sorted(p for p in source.rglob("*.svg") if p.is_file())


def main() -> int:
    parser = argparse.ArgumentParser(description="Rasterize SIGMA SVG assets to PNG")
    parser.add_argument("source", type=Path, help="SVG file or directory tree")
    parser.add_argument("destination", type=Path, help="PNG file for one SVG or output directory for a tree")
    parser.add_argument("--width", type=int, default=None, help="Expected PNG width")
    parser.add_argument("--height", type=int, default=None, help="Expected PNG height")
    args = parser.parse_args()

    files = collect_svg_files(args.source)
    if not files:
        raise SystemExit("SIGMA_RASTER_ERROR: no SVG files found")

    results = []
    if args.source.is_file():
        dest = args.destination
        if dest.suffix.lower() != ".png":
            raise SystemExit("SIGMA_RASTER_ERROR: destination must end in .png for a single SVG")
        results.append(rasterize_one(args.source, dest, args.width, args.height))
    else:
        for svg in files:
            rel = svg.relative_to(args.source).with_suffix(".png")
            png = args.destination / rel
            results.append(rasterize_one(svg, png, args.width, args.height))

    for r in results:
        print(
            "SIGMA_RASTER_PASS",
            r["svg"],
            "->",
            r["png"],
            f'{r["width"]}x{r["height"]}',
            f'png_sha256={r["png_sha256"]}',
        )
    print(f"SIGMA_RASTER_BATCH_PASS count={len(results)} cairosvg={cairosvg.__version__}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
