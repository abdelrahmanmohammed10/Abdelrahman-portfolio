---
name: color-theory-pro
description: Reference and guide for color theory, color wheel harmonies, WCAG contrast ratios, typography scale colors, and natural skies in light/dark themes.
---

# Color Theory & Stacking Harmony Guide

This guide defines design tokens, color wheels, mathematical harmonies, and contrast rules for web and mobile interfaces.

---

## 1. The Color Wheel & Harmonies

The color wheel organizes color relationships in HSL (Hue, Saturation, Lightness) space, where Hue ranges from `0` to `360` degrees:

| Color Group | Hue Range (Degrees) | Primary Associations |
|---|---|---|
| **Reds / Oranges** | 0° - 45° | Warmth, energy, attention, passion |
| **Yellows / Ambers** | 46° - 75° | Sunshine, caution, warmth, friendliness |
| **Greens / Emeralds** | 76° - 165° | Growth, success, safety, nature |
| **Cyans / Teals** | 166° - 210° | Cleanliness, clarity, focus, aurora |
| **Blues / Azures** | 211° - 260° | Trust, sky, ocean, calm, security |
| **Purples / Violets** | 261° - 315° | Ionosphere, luxury, creative, mystery |
| **Pinks / Magentas** | 316° - 359° | Vibration, premium, playfulness |

### Harmony Math
To derive visually stable color schemes from a base hue $H$:

1. **Complementary** (High Contrast):
   - Contrast Hue: $H_c = (H + 180) \bmod 360$
2. **Analogous** (Calm, Unified):
   - Adjacent Hues: $H_1 = (H - 30) \bmod 360$ and $H_2 = (H + 30) \bmod 360$
3. **Triadic** (Balanced, Vibrant):
   - Hues: $H_1 = (H + 120) \bmod 360$ and $H_2 = (H + 240) \bmod 360$
4. **Split-Complementary** (Vibrant Contrast without Clashing):
   - Hues: $H_1 = (H + 150) \bmod 360$ and $H_2 = (H + 210) \bmod 360$
5. **Monochromatic Scale** (Cohesive depth):
   - Keep $H$ constant; vary Saturation $S$ and Lightness $L$ to create surface, border, text, and active tokens.

---

## 2. Contrast Ratios & Readability (WCAG 2.1 / 2.2)

To calculate the contrast ratio between a foreground color $L_1$ and a background color $L_2$ (where $L_1 > L_2$):

$$\text{Contrast Ratio} = \frac{L_1 + 0.05}{L_2 + 0.05}$$

Where Relative Luminance $L$ of a color is calculated from normalized sRGB components ($R, G, B \in [0, 1]$):

$$L = 0.2126 \times f(R) + 0.7152 \times f(G) + 0.0722 \times f(B)$$

$$f(x) = \begin{cases} 
      \frac{x}{12.92} & x \le 0.04045 \\
      \left(\frac{x + 0.055}{1.055}\right)^{2.4} & x > 0.04045
   \end{cases}$$

### WCAG Standards for Typography

*   **WCAG AA (Standard):**
    *   **Normal text** (under 18pt/14pt bold): Minimum **4.5:1**
    *   **Large text** (18pt/14pt bold and above): Minimum **3:1**
    *   **UI Controls & Icons:** Minimum **3:1**
*   **WCAG AAA (Enhanced):**
    *   **Normal text:** Minimum **7:1**
    *   **Large text:** Minimum **4.5:1**

---

## 3. Light Theme vs. Dark Mode Design Tokens

To achieve visual symmetry across themes, tokens must be inverted logically, keeping high readability:

| Surface Layer | Dark Theme Value (OLED/Midnight) | Light Theme Value (Atmospheric Sky) |
|---|---|---|
| **Root Background** | `#000000` to `#090D1A` | `#F0F9FF` to `#FFFFFF` |
| **Card / Glass Backdrops**| `rgba(30, 58, 138, 0.12)` | `rgba(255, 255, 255, 0.96)` |
| **Borders** | `rgba(255, 255, 255, 0.08)` | `rgba(30, 61, 97, 0.15)` |
| **Hover Borders** | `rgba(255, 159, 28, 0.5)` | `rgba(2, 105, 122, 0.5)` |
| **Primary Text** | `#F8F9FA` | `#0A0F1A` |
| **Muted Text** | `rgba(248, 249, 250, 0.6)` | `#1E293B` |
| **Active Accent Highlights**| `#2EC4B6` (Teal) / `#FF9F1C` (Gold) | `#02697a` (Deep Cerulean) / `#7a5100` (Amber) |

---

## 4. Designing Natural Skies & Realistic Gradients

A cartoonish sky uses arbitrary saturated blues and purples. A realistic sky mimics **Rayleigh and Mie scattering**:

1. **Zenith (Top of screen):** Richer, deeper blue-azure (light is less scattered).
   - *Example:* `#7bb5e3` or `#6fa3cf`
2. **Horizon (Lower-middle):** Paled, warmer blue-cream (light passes through more air, scattering blue and leaving warm tones).
   - *Example:* `#d1ebfa` merging to `#fbf5e6`
3. **Clouds:** Must not be solid flat shapes. They are vaporous.
   - Use dynamic scaling, opacity fluctuations (`alpha` between `0.45 - 0.70`), and a CSS `blur(1px)` or `blur(2px)` to blend cloud boundaries softly with the background.

---

## 5. Typography Scale Hierarchy & Spacing

To align text, keep a strict font-size and letter-spacing rhythm:

| Element Role | Font Size (rem) | Letter Spacing | Font Weight |
|---|---|---|---|
| **Hero Name** | 3.5rem - 4.5rem | `-0.02em` | 800 (Bold) |
| **Display Headings** | 2.2rem - 2.8rem | `-0.015em` | 700 (Semi-Bold) |
| **Section Subtitles** | 1.1rem - 1.3rem | `normal` | 600 (Medium) |
| **Body Text** | 1.0rem | `normal` | 400 (Regular) |
| **AR (Arabic) Text** | Keep size | `normal !important` | Add +100 weight |

> [!WARNING]
> Never apply custom letter-spacing to Arabic scripts, as it ruptures the cursiveness (ligatures) of the letters, rendering them as isolated disjointed symbols.
