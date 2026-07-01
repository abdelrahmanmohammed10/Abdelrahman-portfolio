import sys
import math

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    if len(hex_str) == 3:
        hex_str = ''.join([c*2 for c in hex_str])
    return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))

def rgb_to_hex(r, g, b):
    return f"#{int(r):02X}{int(g):02X}{int(b):02X}"

def rgb_to_hsl(r, g, b):
    r, g, b = r / 255.0, g / 255.0, b / 255.0
    mx = max(r, g, b)
    mn = min(r, g, b)
    df = mx - mn
    l = (mx + mn) / 2.0
    
    if df == 0:
        h = 0
        s = 0
    else:
        s = df / (2.0 - mx - mn) if l > 0.5 else df / (mx + mn)
        if mx == r:
            h = (g - b) / df + (6 if g < b else 0)
        elif mx == g:
            h = (b - r) / df + 2
        else:
            h = (r - g) / df + 4
        h = h * 60.0
    return round(h), round(s * 100), round(l * 100)

def hsl_to_rgb(h, s, l):
    h, s, l = h / 360.0, s / 100.0, l / 100.0
    if s == 0:
        r = g = b = l
    else:
        def hue_to_rgb(p, q, t):
            if t < 0: t += 1
            if t > 1: t -= 1
            if t < 1/6: return p + (q - p) * 6 * t
            if t < 1/2: return q
            if t < 2/3: return p + (q - p) * (2/3 - t) * 6
            return p
            
        q = l * (1 + s) if l < 0.5 else l + s - l * s
        p = 2 * l - q
        r = hue_to_rgb(p, q, h + 1/3)
        g = hue_to_rgb(p, q, h)
        b = hue_to_rgb(p, q, h - 1/3)
    return round(r * 255), round(g * 255), round(b * 255)

def relative_luminance(r, g, b):
    def channel_lum(val):
        normalized = val / 255.0
        if normalized <= 0.03928:
            return normalized / 12.92
        else:
            return math.pow((normalized + 0.055) / 1.055, 2.4)
            
    return 0.2126 * channel_lum(r) + 0.7152 * channel_lum(g) + 0.0722 * channel_lum(b)

def contrast_ratio(hex1, hex2):
    r1, g1, b1 = hex_to_rgb(hex1)
    r2, g2, b2 = hex_to_rgb(hex2)
    l1 = relative_luminance(r1, g1, b1)
    l2 = relative_luminance(r2, g2, b2)
    brightest = max(l1, l2)
    darkest = min(l1, l2)
    return (brightest + 0.05) / (darkest + 0.05)

def get_harmonies(hex_color):
    r, g, b = hex_to_rgb(hex_color)
    h, s, l = rgb_to_hsl(r, g, b)
    
    harmonies = {
        "Complementary": (h + 180) % 360,
        "Analogous_Left": (h - 30) % 360,
        "Analogous_Right": (h + 30) % 360,
        "Triadic_1": (h + 120) % 360,
        "Triadic_2": (h + 240) % 360,
        "Split_1": (h + 150) % 360,
        "Split_2": (h + 210) % 360
    }
    
    results = {}
    for name, hue in harmonies.items():
        hr, hg, hb = hsl_to_rgb(hue, s, l)
        results[name] = rgb_to_hex(hr, hg, hb)
    return results

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python color_wheel_calculator.py <color1_hex> [<color2_hex>]")
        sys.exit(1)
        
    color1 = sys.argv[1]
    if len(sys.argv) == 3:
        color2 = sys.argv[2]
        ratio = contrast_ratio(color1, color2)
        print(f"Contrast Ratio between {color1} and {color2}: {ratio:.2f}:1")
        print("WCAG AA Normal Text (4.5:1):", "PASS" if ratio >= 4.5 else "FAIL")
        print("WCAG AA Large Text (3.0:1):", "PASS" if ratio >= 3.0 else "FAIL")
        print("WCAG AAA Normal Text (7.0:1):", "PASS" if ratio >= 7.0 else "FAIL")
    else:
        print(f"Color: {color1}")
        harmonies = get_harmonies(color1)
        for name, value in harmonies.items():
            print(f"- {name}: {value}")
