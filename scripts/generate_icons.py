from pathlib import Path
import struct
import zlib


ROOT = Path(__file__).resolve().parents[1]
ICON_DIR = ROOT / "icons"
ICON_DIR.mkdir(exist_ok=True)


def png_chunk(kind, data):
    return (
        struct.pack(">I", len(data))
        + kind
        + data
        + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)
    )


def write_png(path, size, maskable=False):
    bg = (24, 33, 31, 255)
    panel = (245, 242, 236, 255)
    accent = (40, 95, 85, 255)
    red = (216, 77, 71, 255)
    green = (49, 166, 106, 255)
    gray = (144, 151, 155, 255)

    pixels = []
    safe = int(size * (0.10 if maskable else 0.0))
    card_margin = int(size * (0.18 if maskable else 0.12))
    card_min = card_margin
    card_max = size - card_margin
    radius = int(size * 0.08)

    for y in range(size):
        row = bytearray()
        row.append(0)
        for x in range(size):
            color = bg
            if x < safe or y < safe or x >= size - safe or y >= size - safe:
                color = bg
            else:
                inside_card = card_min <= x < card_max and card_min <= y < card_max
                if inside_card:
                    dx = min(x - card_min, card_max - 1 - x)
                    dy = min(y - card_min, card_max - 1 - y)
                    if dx >= radius or dy >= radius or (dx - radius) ** 2 + (dy - radius) ** 2 <= radius**2:
                        color = panel

                stripe_top = int(size * 0.25)
                stripe_bottom = int(size * 0.36)
                if card_min <= x < card_max and stripe_top <= y < stripe_bottom:
                    color = accent

                box = int(size * 0.12)
                gap = int(size * 0.055)
                start_x = int(size * 0.28)
                start_y = int(size * 0.48)
                colors = (green, red, gray)
                for i, dot_color in enumerate(colors):
                    cx = start_x + i * (box + gap) + box // 2
                    cy = start_y + box // 2
                    if (x - cx) ** 2 + (y - cy) ** 2 <= (box // 2) ** 2:
                        color = dot_color

                line_y = int(size * 0.68)
                line_h = max(3, int(size * 0.035))
                if int(size * 0.29) <= x <= int(size * 0.71) and line_y <= y < line_y + line_h:
                    color = accent

                line_y2 = int(size * 0.76)
                if int(size * 0.34) <= x <= int(size * 0.66) and line_y2 <= y < line_y2 + line_h:
                    color = accent

            row.extend(color)
        pixels.append(bytes(row))

    raw = b"".join(pixels)
    png = (
        b"\x89PNG\r\n\x1a\n"
        + png_chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
        + png_chunk(b"IDAT", zlib.compress(raw, 9))
        + png_chunk(b"IEND", b"")
    )
    path.write_bytes(png)


write_png(ICON_DIR / "icon-192.png", 192)
write_png(ICON_DIR / "icon-512.png", 512)
write_png(ICON_DIR / "maskable-512.png", 512, maskable=True)
write_png(ICON_DIR / "apple-touch-icon.png", 180)
