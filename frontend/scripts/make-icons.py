# Generates original RiverReady icons (teal tile, three white wave lines). Run: python3 -I scripts/make-icons.py
from PIL import Image, ImageDraw
import math

def draw(size, safe):
    # safe = fraction of the canvas the artwork may use (maskable icons need ~0.6)
    img = Image.new("RGB", (size, size), "#0f4c5c")
    d = ImageDraw.Draw(img)
    span = size * safe
    x0 = (size - span) / 2
    for i, y in enumerate((0.38, 0.52, 0.66)):
        pts = []
        for s in range(0, 101):
            t = s / 100
            x = x0 + span * t
            yy = size * (0.5 + (y - 0.5) * safe) + math.sin(t * math.pi * 2 + i) * span * 0.06
            pts.append((x, yy))
        d.line(pts, fill="#ffffff", width=max(2, int(size * 0.045)), joint="curve")
    return img

draw(192, 0.7).save("public/icons/icon-192.png")
draw(512, 0.7).save("public/icons/icon-512.png")
draw(512, 0.5).save("public/icons/maskable-512.png")
draw(180, 0.7).save("public/icons/apple-touch-icon.png")
