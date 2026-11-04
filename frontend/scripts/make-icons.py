# Generates the original RiverReady icons (Phase 5b identity): a teal river cutting diagonally through
# layers of earth (moss, ochre, clay) on deep umber. Colours match src/styles/tokens.css.
# Run from frontend/: python3 -I scripts/make-icons.py
from PIL import Image, ImageDraw
import math

UMBER, MOSS, OCHRE, CLAY = "#3a2a1e", "#4c5a2c", "#8f6a26", "#7c3a22"
RIVER, HIGHLIGHT, BANK = "#2a9d98", "#8fd6cf", "#241a12"
SS = 4  # draw at 4x and scale down, for smooth (anti-aliased) edges


def wave(size, base, amp, phase, steps=120):
    # Points along one wavy band edge across the full width.
    return [(size * t / steps, size * (base + amp * math.sin(t / steps * math.pi * 2 + phase))) for t in range(steps + 1)]


def brush(d, pts, colour, width):
    # Stamp a circle at every point: gives a smooth ribbon with round ends and no join artefacts.
    r = width / 2
    for x, y in pts:
        d.ellipse((x - r, y - r, x + r, y + r), fill=colour)


def draw(size, safe):
    # safe = fraction of the canvas the river may use (maskable icons need ~0.6 or less).
    S = size * SS
    img = Image.new("RGB", (S, S), UMBER)
    d = ImageDraw.Draw(img)
    # Earth strata are full-bleed, so they still fill the shape after an OS mask crops the corners.
    for colour, base, amp, phase in ((MOSS, 0.42, 0.04, 0.6), (OCHRE, 0.60, 0.035, 2.2), (CLAY, 0.78, 0.03, 4.0)):
        d.polygon(wave(S, base, amp, phase) + [(S, S), (0, S)], fill=colour)
    # River: enters top-left, meanders once, leaves bottom-right; kept inside the safe zone.
    def at(t):
        x = 0.5 + safe * (t - 0.5)
        y = 0.5 + safe * (0.62 * (t - 0.5) - 0.16 * math.sin(t * math.pi * 2))
        return (S * x, S * y)
    pts = [at(t / 600) for t in range(601)]
    brush(d, pts, BANK, S * 0.22 * safe)
    brush(d, pts, RIVER, S * 0.15 * safe)
    brush(d, pts[60:540], HIGHLIGHT, S * 0.03 * safe)
    # Flat artwork needs few colours: a 64-colour palette keeps the PNGs small (smaller precache).
    return img.resize((size, size), Image.LANCZOS).quantize(64)


draw(192, 0.76).save("public/icons/icon-192.png")
draw(512, 0.76).save("public/icons/icon-512.png")
draw(512, 0.6).save("public/icons/maskable-512.png")
draw(180, 0.76).save("public/icons/apple-touch-icon.png")
