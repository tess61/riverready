#!/usr/bin/env python3
"""Generate the page backdrop ("river currents") as inline SVG data URIs for src/styles/tokens.css.

Two layers in one SVG, drawn on a 1600x1000 canvas:
  1. Wide, heavily blurred colour ribbons (aqua, electric blue, violet, mint): glowing currents.
  2. Fine flow lines on top (crisp, low opacity): a topographic current map.
The liquid glass on cards and buttons bends both layers at its rim, which is what makes the glass visible.
Original artwork, generated from simple curves. Run:  python3 scripts/make-flow.py  and paste the two lines
into tokens.css (--flow in the light and dark sets).
"""
import math
from urllib.parse import quote

W, H = 1600, 1000
STEP = 52  # spacing between flow lines


def curve(i):
    """One gently S-shaped current across the canvas. Amplitude varies per line so they never look ruled."""
    y = -120 + i * STEP
    a = 150 + 40 * math.sin(i * 0.7)
    return f"M-60 {y:.0f}C420 {y - a:.0f} 980 {y + a + 30:.0f} 1660 {y - 50:.0f}"


# (line index, colour key, stroke width) for the blurred ribbons
RIBBONS = [(4, "aqua", 200), (8, "blue", 170), (12, "violet", 190), (16, "mint", 150), (20, "aqua", 170), (23, "blue", 150)]

# "Deep Current" theme: glowing currents on ink navy (dark); the same river in morning mist (light).
THEMES = {
    "light": dict(alpha=0.28, line="#2a3a66", line_alpha=0.14,
                  aqua="#5fd6cc", blue="#7fa2ff", violet="#a68cff", mint="#7fe3bd"),
    "dark": dict(alpha=0.4, line="#cfe0ff", line_alpha=0.07,
                 aqua="#22d3c5", blue="#3b6cff", violet="#7c4dff", mint="#2fe0a0"),
}


def svg(t):
    ribbons = "".join(
        f"<path d='{curve(i)}' stroke='{t[c]}' stroke-width='{w}'/>" for i, c, w in RIBBONS
    )
    lines = "".join(f"<path d='{curve(i)}'/>" for i in range(24))
    return (
        f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {W} {H}' preserveAspectRatio='xMidYMid slice'>"
        "<filter id='b' x='-20%' y='-20%' width='140%' height='140%'><feGaussianBlur stdDeviation='55'/></filter>"
        f"<g fill='none' stroke-linecap='round' opacity='{t['alpha']}' filter='url(#b)'>{ribbons}</g>"
        f"<g fill='none' stroke='{t['line']}' stroke-opacity='{t['line_alpha']}' stroke-width='1.3'>{lines}</g>"
        "</svg>"
    )


for name, t in THEMES.items():
    print(f"/* {name} */  --flow: url(\"data:image/svg+xml,{quote(svg(t), safe=' =:/,.-')}\");")
