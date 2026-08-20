import pathlib

site = pathlib.Path(r'C:\Users\Prashant Chaudhary\OneDrive\Documents\Prashant\Agents\Agentic Nikhil\xyntriq-site')
css = (site / 'assets' / 'style.css').read_text(encoding='utf-8')
style_link = '<link rel="stylesheet" href="assets/style.css?v=20">'
style_inline = '<style>\n/* assets/style.css inlined for LCP */\n' + css + '\n</style>'
font_link = '<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Roboto:wght@400;500;700;900&display=swap" rel="stylesheet">'
font_new = ('<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Roboto:wght@400;500;700;900&display=swap" onload="this.onload=null;this.rel=\'stylesheet\'">'
            '<noscript><link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Roboto:wght@400;500;700;900&display=swap" rel="stylesheet"></noscript>')

count = 0
for html in sorted(site.glob('*.html')):
    t = html.read_text(encoding='utf-8')
    if style_link not in t:
        print('MISS style link in', html.name)
        continue
    t = t.replace(style_link, style_inline, 1)
    if font_link in t:
        t = t.replace(font_link, font_new, 1)
    t = t.replace('assets/script.js?v=20', 'assets/script.js?v=21')
    html.write_text(t, encoding='utf-8')
    count += 1
    print('ok', html.name)
print('total pages inlined:', count)
