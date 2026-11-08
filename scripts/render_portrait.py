#!/usr/bin/env python3

import argparse
from pathlib import Path
import struct
import zlib


PIXELS = """
................................
................................
................................
................................
................................
.............HHHHH..............
...........HHHHHHHHH............
.........HHHHHHHHHHHH...........
........HHHHHHHHHHHHH...........
.........HHHHHHHHHHHHH..........
.......HHHHHHHHHSSSHHHH.........
.......HHHHHSSSSSSSSHHH.........
........HHSSSSSSSSSSHHH.........
........HHHSSSSSSSSSSHH.........
........HHHSSSSSSSSSSHH.........
.........HHSSESSSSESSH..........
.........SHSSSSSSSSSSHS.........
.........SSSSSSNSSSSSSS.........
..........SSSSSSSSSSSS..........
..........SSSSSEESSSSS..........
...........SSSSSSSSSS...........
............SSSSSSSS............
.............SSSSSS.............
...........DDDSSSSDDD...........
..........DTDSSSSSSDTD..........
..........DTDRSSSSRDTD..........
........TTDTTTRRRRTTTDTT........
.......TTTTDDDDRRDDDDTTTT.......
......TTTTTTTTDRDDTTTTTTTT......
......TTTTTTTTTTDTTTTTTTTT......
.....TTTTTTTTTTTDTTTTTTTTTT.....
................................
""".strip().splitlines()

PALETTE = {
    ".": "#71899F",  # background
    "H": "#683713",  # hair
    "S": "#FFC397",  # skin
    "E": "#30221B",  # eyes and mouth
    "N": "#D68A59",  # nose
    "T": "#087577",  # teal jacket
    "D": "#03484C",  # collar and zip
    "R": "#A84720",  # rust shirt
}
ASCII_BACKGROUND = "#151a2e"


def png_chunk(kind, data):
    return (struct.pack(">I", len(data)) + kind + data
            + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF))


def render(output, scale):
    if scale < 1:
        raise ValueError("Scale must be a positive integer")
    if len(PIXELS) != 32 or any(len(row) != 32 for row in PIXELS):
        raise ValueError("The portrait must contain exactly 32 rows of 32 squares")
    colors = {key: bytes.fromhex(color.lstrip("#")) for key, color in PALETTE.items()}

    scanlines = bytearray()
    for row in PIXELS:
        scanline = b"\x00" + b"".join(colors[cell] * scale for cell in row)
        scanlines.extend(scanline * scale)

    size = 32 * scale
    header = struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)
    output.write_bytes(
        b"\x89PNG\r\n\x1a\n"
        + png_chunk(b"IHDR", header)
        + png_chunk(b"IDAT", zlib.compress(scanlines, level=9))
        + png_chunk(b"IEND", b"")
    )
    print(f"Rendered {size}x{size} portrait to {output}")


def render_ascii(output, scale):
    # Write the grid itself as monospace text, each character in its colour.
    size = 32 * scale
    positions = " ".join(str(scale * column + scale // 2) for column in range(32))
    rows = []
    for index, row in enumerate(PIXELS):
        spans = "".join(f'<tspan fill="{PALETTE[cell]}">{cell}</tspan>' for cell in row)
        rows.append(f'<text x="{positions}" y="{scale * index + scale // 2}">{spans}</text>')
    output.write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">\n'
        f'<rect width="100%" height="100%" fill="{ASCII_BACKGROUND}"/>\n'
        f'<g font-family="ui-monospace, Menlo, Consolas, monospace" font-size="{scale}" font-weight="700" '
        f'text-anchor="middle" dominant-baseline="central">\n'
        + "\n".join(rows) + "\n</g>\n</svg>\n"
    )
    print(f"Rendered ASCII portrait to {output}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--scale", type=int, default=16, help="Square size in pixels (default: 16)")
    parser.add_argument("--output", type=Path,
                        default=Path(__file__).resolve().parents[1] / "images/profile-pixel.png")
    parser.add_argument("--ascii-output", type=Path,
                        default=Path(__file__).resolve().parents[1] / "images/profile-ascii.svg")
    args = parser.parse_args()
    if args.scale < 1:
        parser.error("--scale must be a positive integer")
    render(args.output, args.scale)
    render_ascii(args.ascii_output, args.scale)
