#!/usr/bin/env python3
"""Generate a 2048x2048 wind-slash flipbook sprite sheet (8x8 grid, 64 frames)."""

import numpy as np
from PIL import Image

CELL = 256
GRID = 8
FRAMES = GRID * GRID
SIZE = CELL * GRID


def smoothstep(edge0, edge1, x):
    t = np.clip((x - edge0) / (edge1 - edge0 + 1e-8), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def make_frame(t):
    y, x = np.indices((CELL, CELL), dtype=np.float32)
    cx = x - (CELL - 1) / 2.0
    cy = y - (CELL - 1) / 2.0
    r = np.hypot(cx, cy)
    angle = np.arctan2(cy, cx)

    # Phase: 0..pi builds the slash, pi..2pi dissipates it.
    phase = t % (2.0 * np.pi)
    build = phase / np.pi if phase < np.pi else 2.0 - phase / np.pi

    # Crescent geometry: outer circle minus an offset inner circle.
    outer_r = 90 + build * 18
    inner_r = 78 + build * 8
    offset = 28 - build * 12  # inner circle offset along +x

    in_outer = r < outer_r
    # distance from inner center
    inner_dx = cx - offset
    inner_dy = cy
    inner_dist = np.hypot(inner_dx, inner_dy)
    in_inner = inner_dist < inner_r

    crescent = in_outer & (~in_inner)

    # Angle mask: keep only the right-facing crescent arc.
    angle_mask = (angle > -np.pi * 0.55) & (angle < np.pi * 0.55)
    crescent &= angle_mask

    # Soft edge falloff.
    edge = smoothstep(outer_r, outer_r - 6, r) * smoothstep(inner_r, inner_r + 6, inner_dist)
    intensity = crescent.astype(np.float32) * edge

    # Mint-green base with white core.
    R = intensity * 0.85
    G = intensity * 0.95
    B = intensity * 1.0

    # Core bright white along the inner edge.
    core = np.exp(-((inner_dist - inner_r) ** 2) / 20.0) * angle_mask
    R += core * 0.6
    G += core * 0.65
    B += core * 0.7

    # Motion-blur speed lines trailing along the arc.
    streaks = np.zeros_like(r)
    streak_count = 24
    rng = np.random.default_rng(int(t * 10000) % 2**31)
    for i in range(streak_count):
        theta = (i / streak_count) * np.pi * 1.1 - np.pi * 0.55
        # Offset radius and length based on build.
        rad = 40 + build * 40 + rng.random() * 20
        length = 10 + build * 25 + rng.random() * 15
        width = 1.2 + rng.random() * 1.2
        # Pixel coordinates along the streak direction.
        ux = np.cos(theta)
        uy = np.sin(theta)
        px = cx - rad * ux
        py = cy - rad * uy
        proj = px * ux + py * uy
        perp = -px * uy + py * ux
        streak = np.exp(-(proj ** 2) / (2 * (length / 2.5) ** 2)) * np.exp(-(perp ** 2) / (2 * width ** 2))
        streaks += streak * (0.3 + build * 0.5)

    # Wisps peeling off the outer edge.
    wisp = np.zeros_like(r)
    wisp_count = 16
    for i in range(wisp_count):
        theta = (i / wisp_count) * np.pi * 1.1 - np.pi * 0.55
        rad = outer_r - 4 + rng.random() * 12
        arc_len = 0.3 + rng.random() * 0.4
        # small swirl
        ux = np.cos(theta)
        uy = np.sin(theta)
        px = cx - rad * ux
        py = cy - rad * uy
        dist = np.hypot(px, py)
        wisp += np.exp(-(dist ** 2) / (2 * (3.0 + build * 4.0) ** 2)) * (0.2 + build * 0.3)

    # Combine.
    R = R + streaks * 0.7 + wisp * 0.5
    G = G + streaks * 0.85 + wisp * 0.7
    B = B + streaks * 0.9 + wisp * 0.8

    # Dissipation: fade everything toward the end.
    if phase >= np.pi:
        fade = 1.0 - smoothstep(np.pi, 2.0 * np.pi, phase)
        R *= fade
        G *= fade
        B *= fade

    img = np.zeros((CELL, CELL, 4), dtype=np.uint8)
    img[..., 0] = (np.clip(R, 0, 1) * 255).astype(np.uint8)
    img[..., 1] = (np.clip(G, 0, 1) * 255).astype(np.uint8)
    img[..., 2] = (np.clip(B, 0, 1) * 255).astype(np.uint8)
    img[..., 3] = 255
    return img


def main():
    sheet = np.zeros((SIZE, SIZE, 4), dtype=np.uint8)
    for f in range(FRAMES):
        t = f / FRAMES * (2.0 * np.pi)
        frame = make_frame(t)
        row = f // GRID
        col = f % GRID
        sheet[row * CELL:(row + 1) * CELL, col * CELL:(col + 1) * CELL] = frame

    Image.fromarray(sheet, 'RGBA').save('assets/wind_slash_spritesheet.png')
    print('saved assets/wind_slash_spritesheet.png')


if __name__ == '__main__':
    main()
