import re
from pathlib import Path

# Setup paths using Pathlib as per python-pro guidelines
BASE_DIR: Path = Path("H:/work/Abdelrahman-portfolio")
HTML_PATH: Path = BASE_DIR / "index.html"
CV_HTML_PATH: Path = BASE_DIR / "cv plan/index.html"
CSS_PATH: Path = BASE_DIR / "style.css"
JS_PATH: Path = BASE_DIR / "script.js"

MIN_CSS_PATH: Path = BASE_DIR / "style.min.css"
MIN_JS_PATH: Path = BASE_DIR / "script.min.js"

def minify_css(css_content: str) -> str:
    """Minify CSS content by removing comments, whitespace, and extra newlines.

    Args:
        css_content: The raw CSS string.

    Returns:
        The minified CSS string.
    """
    # Remove comments
    css = re.sub(r'/\*.*?\*/', '', css_content, flags=re.DOTALL)
    # Remove spaces around operators and braces
    css = re.sub(r'\s*([\{\}:;,])\s*', r'\1', css)
    # Replace multiple spaces with single space
    css = re.sub(r'\s+', ' ', css)
    # Remove leading/trailing spaces
    return css.strip()

def minify_js(js_content: str) -> str:
    """Safely reduce comments and redundant newlines from JavaScript code.

    Args:
        js_content: The raw JavaScript string.

    Returns:
        The cleaned JavaScript string with comments removed.
    """
    # Matches strings, regexes, template literals, and comments
    pattern = re.compile(
        r'("([^"\\]|\\.)*")|'      # double-quoted string
        r'(\'([^\'\\]|\\.)*\')|'    # single-quoted string
        r'(`([^`\\]|\\.)*`)|'      # template literal
        r'(/\*.*?\*/)|'            # multi-line comment
        r'(//.*?(\n|$))',          # single-line comment
        re.DOTALL
    )
    def replace(match: re.Match[str]) -> str:
        s = match.group(0)
        if s.startswith('/*') or s.startswith('//'):
            return '' if s.startswith('/*') else '\n'
        return s
    
    # Strip comments safely
    js = pattern.sub(replace, js_content)
    # Clean up redundant empty lines (reduce 3+ newlines to just 1 or 2 newlines)
    return re.sub(r'\n\s*\n\s*\n', '\n\n', js)

def run_build() -> None:
    """Runs the production build pipeline.

    Minifies CSS and JS files, and updates references inside HTML pages
    to point to the minified assets with query parameters.
    """
    print("--- STARTING PRODUCTION BUILD & MINIFICATION ---")
    
    # 1. Minify style.css
    if CSS_PATH.exists():
        try:
            with CSS_PATH.open('r', encoding='utf-8') as f:
                css_data = f.read()
            orig_css_size = len(css_data.encode('utf-8'))
            min_css_data = minify_css(css_data)
            min_css_size = len(min_css_data.encode('utf-8'))
            
            with MIN_CSS_PATH.open('w', encoding='utf-8') as f:
                f.write(min_css_data)
            
            savings = orig_css_size - min_css_size
            savings_pct = (savings / orig_css_size) * 100
            print(f"CSS Minified: {orig_css_size/1024:.2f}KB -> {min_css_size/1024:.2f}KB (Saved {savings/1024:.2f}KB / {savings_pct:.1f}%)")
        except IOError as e:
            print(f"Error handling CSS file: {e}")
    else:
        print("CSS source file not found!")

    # 2. Minify script.js
    if JS_PATH.exists():
        try:
            with JS_PATH.open('r', encoding='utf-8') as f:
                js_data = f.read()
            orig_js_size = len(js_data.encode('utf-8'))
            min_js_data = minify_js(js_data)
            min_js_size = len(min_js_data.encode('utf-8'))
            
            with MIN_JS_PATH.open('w', encoding='utf-8') as f:
                f.write(min_js_data)
                
            savings = orig_js_size - min_js_size
            savings_pct = (savings / orig_js_size) * 100
            print(f"JS Minified: {orig_js_size/1024:.2f}KB -> {min_js_size/1024:.2f}KB (Saved {savings/1024:.2f}KB / {savings_pct:.1f}%)")
        except IOError as e:
            print(f"Error handling JS file: {e}")
    else:
        print("JS source file not found!")

    # 3. Update HTML references to minified assets
    for filepath in [HTML_PATH, CV_HTML_PATH]:
        if not filepath.exists():
            continue
        try:
            with filepath.open('r', encoding='utf-8') as f:
                html_data = f.read()
                
            original = html_data
            
            # Replace stylesheet references with .min.css using regex
            html_data = re.sub(r'href="(\.\./)?style\.css(\?v=\d+\.\d+\.\d+)?"', r'href="\1style.min.css?v=5.0.0"', html_data)
            # Replace javascript references with .min.js using regex
            html_data = re.sub(r'src="(\.\./)?script\.js(\?v=\d+\.\d+\.\d+)?"', r'src="\1script.min.js?v=4.5.0"', html_data)
            
            if html_data != original:
                with filepath.open('w', encoding='utf-8') as f:
                    f.write(html_data)
                print(f"Updated HTML file: {filepath} to point to minified assets")
            else:
                print(f"HTML file {filepath} already matches or has no changes needed")
        except IOError as e:
            print(f"Error handling HTML file {filepath}: {e}")

if __name__ == "__main__":
    run_build()
