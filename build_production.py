import os
import re

html_path = "H:/work/Abdelrahman-portfolio/index.html"
cv_html_path = "H:/work/Abdelrahman-portfolio/cv plan/index.html"
css_path = "H:/work/Abdelrahman-portfolio/style.css"
js_path = "H:/work/Abdelrahman-portfolio/script.js"

min_css_path = "H:/work/Abdelrahman-portfolio/style.min.css"
min_js_path = "H:/work/Abdelrahman-portfolio/script.min.js"

def minify_css(css_content):
    # Remove comments
    css = re.sub(r'/\*.*?\*/', '', css_content, flags=re.DOTALL)
    # Remove spaces around operators and braces
    css = re.sub(r'\s*([\{\}:;,])\s*', r'\1', css)
    # Replace multiple spaces with single space
    css = re.sub(r'\s+', ' ', css)
    # Remove leading/trailing spaces
    css = css.strip()
    return css

def minify_js(js_content):
    # Safe JS Comment and Whitespace reduction
    # Matches strings, regexes, template literals, and comments
    pattern = re.compile(
        r'("([^"\\]|\\.)*")|'      # double-quoted string
        r'(\'([^\'\\]|\\.)*\')|'    # single-quoted string
        r'(`([^`\\]|\\.)*`)|'      # template literal
        r'(/\*.*?\*/)|'            # multi-line comment
        r'(//.*?(\n|$))',          # single-line comment
        re.DOTALL
    )
    def replace(match):
        s = match.group(0)
        if s.startswith('/*') or s.startswith('//'):
            return '' if s.startswith('/*') else '\n'
        return s
    
    # Strip comments safely
    js = pattern.sub(replace, js_content)
    
    # Clean up redundant empty lines (reduce 3+ newlines to just 1 or 2 newlines)
    js = re.sub(r'\n\s*\n\s*\n', '\n\n', js)
    return js

def run_build():
    print("--- STARTING PRODUCTION BUILD & MINIFICATION ---")
    
    # 1. Minify style.css
    if os.path.exists(css_path):
        with open(css_path, 'r', encoding='utf-8') as f:
            css_data = f.read()
        orig_css_size = len(css_data.encode('utf-8'))
        min_css_data = minify_css(css_data)
        min_css_size = len(min_css_data.encode('utf-8'))
        
        with open(min_css_path, 'w', encoding='utf-8') as f:
            f.write(min_css_data)
        
        savings = orig_css_size - min_css_size
        savings_pct = (savings / orig_css_size) * 100
        print(f"CSS Minified: {orig_css_size/1024:.2f}KB -> {min_css_size/1024:.2f}KB (Saved {savings/1024:.2f}KB / {savings_pct:.1f}%)")
    else:
        print("CSS source file not found!")

    # 2. Minify script.js
    if os.path.exists(js_path):
        with open(js_path, 'r', encoding='utf-8') as f:
            js_data = f.read()
        orig_js_size = len(js_data.encode('utf-8'))
        min_js_data = minify_js(js_data)
        min_js_size = len(min_js_data.encode('utf-8'))
        
        with open(min_js_path, 'w', encoding='utf-8') as f:
            f.write(min_js_data)
            
        savings = orig_js_size - min_js_size
        savings_pct = (savings / orig_js_size) * 100
        print(f"JS Minified: {orig_js_size/1024:.2f}KB -> {min_js_size/1024:.2f}KB (Saved {savings/1024:.2f}KB / {savings_pct:.1f}%)")
    else:
        print("JS source file not found!")

    # 3. Update index.html and cv plan/index.html to reference the minified files
    for filepath in [html_path, cv_html_path]:
        if not os.path.exists(filepath):
            continue
            
        with open(filepath, 'r', encoding='utf-8') as f:
            html_data = f.read()
            
        original = html_data
        
        # Replace stylesheet references with .min.css using regex to support variable query strings
        html_data = re.sub(r'href="(\.\./)?style\.css(\?v=\d+\.\d+\.\d+)?"', r'href="\1style.min.css?v=5.0.0"', html_data)
        
        # Replace javascript references with .min.js using regex
        html_data = re.sub(r'src="(\.\./)?script\.js(\?v=\d+\.\d+\.\d+)?"', r'src="\1script.min.js?v=4.5.0"', html_data)
        
        if html_data != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html_data)
            print(f"Updated HTML file: {filepath} to point to minified assets")
        else:
            print(f"HTML file {filepath} already matches or has no changes needed")

if __name__ == "__main__":
    run_build()
