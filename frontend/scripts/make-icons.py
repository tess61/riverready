# Generates the original RiverReady app icons ("Deep Current" theme): a glowing glass water drop carrying
# two waves, floating over blurred aqua and blue currents on ink navy (two colours, blending). Colours match src/styles/tokens.css.
# Run from frontend/: python3 -I scripts/make-icons.py
from PIL import Image, ImageDraw, ImageFilter, ImageChops
import math

NAVY = (10, 16, 32)                 # --bg (dark)
AQUA, BLUE = (34, 211, 197), (59, 108, 255)
SS = 4  # draw at 4x and scale down, for smooth (anti-aliased) edges


def diagonal(S, a, b, angle):
    # Smooth two-colour gradient across the canvas at the given angle (Pillow's built-in 256-step ramp).
    ramp = Image.linear_gradient("L").rotate(angle, resample=Image.BICUBIC, expand=False).resize((S, S))
    return Image.composite(Image.new("RGB", (S, S), b), Image.new("RGB", (S, S), a), ramp)


def backdrop(S):
    # Soft currents: three wide ribbons, heavily blurred, full-bleed so an OS mask never shows bare corners.
    layer = Image.new("RGB", (S, S), NAVY)
    d = ImageDraw.Draw(layer)
    for colour, base, w in ((AQUA, 0.18, 0.2), (BLUE, 0.55, 0.24), (AQUA, 0.92, 0.24)):
        pts = [(S * t / 80, S * (base + 0.08 * math.sin(t / 80 * math.pi * 2 + base * 5))) for t in range(-4, 85)]
        d.line(pts, fill=colour, width=int(S * w), joint="curve")
    return Image.blend(Image.new("RGB", (S, S), NAVY), layer.filter(ImageFilter.GaussianBlur(S * 0.12)), 0.6)


def drop_mask(S, safe):
    # Water drop: a circle plus the two tangent lines that meet at a point above it.
    r = S * safe * 0.3
    cx, cy = S / 2, S / 2 + r * 0.42
    tip = (cx, cy - r * 2.05)
    a = math.acos(r / (cy - tip[1]))            # angle from "straight up" to each tangent point
    arc = [(cx + r * math.cos(t), cy + r * math.sin(t))
           for t in [(-math.pi / 2 + a) + i / 200 * (2 * math.pi - 2 * a) for i in range(201)]]
    m = Image.new("L", (S, S), 0)
    ImageDraw.Draw(m).polygon([tip] + arc, fill=255)
    return m, (cx, cy, r)


def draw(size, safe):
    # safe = fraction of the canvas the drop may use (maskable icons need ~0.6 or less).
    S = size * SS
    img = backdrop(S)
    mask, (cx, cy, r) = drop_mask(S, safe)
    # Glass body: aqua (top-left) to blue (bottom-right), a little translucent over the currents.
    body = Image.blend(img, diagonal(S, AQUA, BLUE, 45), 0.88)
    img = Image.composite(body, img, mask)
    # Inner glow at the bottom and a 1px-style bright rim, like the in-app glass.
    rim = ImageChops.subtract(mask, mask.filter(ImageFilter.MinFilter((int(S * 0.008) // 2) * 2 + 1)))
    img.paste((255, 255, 255), mask=rim.point(lambda v: int(v * 0.6)))
    d = ImageDraw.Draw(img)
    # Specular highlight: a short arc on the upper-left of the round part.
    d.arc((cx - r * 0.82, cy - r * 0.82, cx + r * 0.82, cy + r * 0.82), 205, 238, fill=(255, 255, 255), width=int(r * 0.09))
    # Two white waves across the drop (the in-app WaveIcon), stamped circles for round, clean strokes.
    rad = r * 0.075
    for dy in (0.02, 0.42):
        for u in range(121):
            x = cx + r * (u / 120 * 1.1 - 0.55)
            y = cy + r * (dy + 0.11 * math.sin(u / 120 * math.pi * 2.4))
            d.ellipse((x - rad, y - rad, x + rad, y + rad), fill=(255, 255, 255))
    small = img.resize((size, size), Image.LANCZOS)
    # 256-colour palette, no dithering: smooth enough for these soft gradients and ~4x smaller than dithered.
    return small.quantize(256)


draw(192, 0.76).save("public/icons/icon-192.png", optimize=True)
draw(512, 0.76).save("public/icons/icon-512.png", optimize=True)
draw(512, 0.6).save("public/icons/maskable-512.png", optimize=True)
draw(180, 0.76).save("public/icons/apple-touch-icon.png", optimize=True)
