import pathlib

site = pathlib.Path(r'C:\Users\Prashant Chaudhary\OneDrive\Documents\Prashant\Agents\Agentic Nikhil\xyntriq-site')
font_css = (site / 'font_css_inline.txt').read_text(encoding='utf-8')

old_pattern = ('<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Roboto:wght@400;500;700;900&display=swap" onload="this.onload=null;this.rel=\'stylesheet\'">'
               '<noscript><link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Roboto:wght@400;500;700;900&display=swap" rel="stylesheet"></noscript>')
new_pattern = '<style>\n/* Google Fonts CSS inlined */\n' + font_css + '\n</style>'

count = 0
for html in sorted(site.glob('*.html')):
    t = html.read_text(encoding='utf-8')
    if old_pattern in t:
        t = t.replace(old_pattern, new_pattern, 1)
    elif 'Google Fonts CSS inlined' not in t:
        print('MISS font pattern in', html.name)
        continue
    t = t.replace('assets/script.js?v=21', 'assets/script.js?v=22')
    html.write_text(t, encoding='utf-8')
    count += 1
print('pages updated:', count)
