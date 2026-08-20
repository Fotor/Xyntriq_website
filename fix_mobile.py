import pathlib, re

site = pathlib.Path(r'C:\Users\Prashant Chaudhary\OneDrive\Documents\Prashant\Agents\Agentic Nikhil\xyntriq-site')
css = (site / 'assets' / 'style.css').read_text(encoding='utf-8')

STYLE_OPEN = '<style>\n/* assets/style.css inlined for LCP */'
CSP_OLD = "default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://sc02.alicdn.com https://sc04.alicdn.com; media-src 'self' https://sc02.alicdn.com https://sc04.alicdn.com; connect-src 'self' https://www.google-analytics.com https://analytics.google.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://forms.gle"
CSP_NEW = "default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com https://www.googletagmanager.com https://cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: https://sc02.alicdn.com https://sc04.alicdn.com; media-src 'self' https://sc02.alicdn.com https://sc04.alicdn.com; connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://cloudflareinsights.com https://unpkg.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://forms.gle"

def build_mobile_menu(html, cta_href, cta_text):
    m = re.search(r'<nav>(.*?)</nav>', html, re.S)
    if not m:
        return None
    links = re.findall(r'<a\s+([^>]*)>(.*?)</a>', m.group(1), re.S)
    items = []
    for attrs, text in links:
        cls = ' class="active"' if 'active' in attrs else ''
        href = re.search(r'href="([^"]+)"', attrs)
        h = href.group(1) if href else '/'
        items.append(f'    <a href="{h}"{cls}>{text.strip()}</a>')
    return ('  <div class="mobile-menu" id="mobileMenu">\n' + '\n'.join(items) +
            f'\n    <a class="mm-cta" href="{cta_href}">{cta_text}</a>\n  </div>')

updated = 0
for html in sorted(site.glob('*.html')):
    t = html.read_text(encoding='utf-8')
    orig = t
    # 1. re-inline updated CSS (idempotent)
    if STYLE_OPEN in t:
        start = t.index(STYLE_OPEN)
        end = t.index('</style>', start)
        t = t[:start] + '<style>\n/* assets/style.css inlined for LCP */\n' + css + '\n</style>' + t[end + len('</style>'):]
    else:
        print('MISS style block in', html.name)
    # 2. burger + mobile menu (idempotent)
    if 'id="menuBtn"' not in t:
        m = re.search(r'<a class="nav-cta" href="([^"]+)">([^<]+)</a>', t)
        if m:
            cta_href, cta_text = m.group(1), m.group(2)
            wrapper = f'<div class="nav-actions"><a class="nav-cta" href="{cta_href}">{cta_text}</a><button class="menu-btn" id="menuBtn" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button></div>'
            t = t.replace(m.group(0), wrapper, 1)
            mm = build_mobile_menu(t, cta_href, cta_text)
            if mm and 'id="mobileMenu"' not in t:
                t = t.replace('</header>', mm + '\n</header>', 1)
            elif not mm:
                print('MISS nav in', html.name)
        else:
            print('MISS nav-cta in', html.name)
    # 3. CSP
    if CSP_OLD in t:
        t = t.replace(CSP_OLD, CSP_NEW, 1)
    elif 'cloudflareinsights.com' not in t:
        print('MISS CSP in', html.name)
    # 4. JS version bump
    t = t.replace('assets/script.js?v=22', 'assets/script.js?v=23')
    if t != orig:
        html.write_text(t, encoding='utf-8')
        updated += 1
        print('ok', html.name)
print('pages updated:', updated)
