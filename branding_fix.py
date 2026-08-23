import pathlib, json, shutil
from PIL import Image

site = pathlib.Path(r'C:\Users\Prashant Chaudhary\OneDrive\Documents\Prashant\Agents\Agentic Nikhil\xyntriq-site')
assets = site / 'assets'

# 1. create favicon-32x32.png from logo
img = Image.open(assets / 'logo-v2.png').convert('RGBA')
img.resize((32, 32), Image.LANCZOS).save(assets / 'favicon-32x32.png', 'PNG')
print('favicon-32x32.png created')

# 2. copy favicon.ico + 32x32 to site ROOT (Google default /favicon.ico lookup)
shutil.copyfile(assets / 'favicon.ico', site / 'favicon.ico')
shutil.copyfile(assets / 'favicon-32x32.png', site / 'favicon-32x32.png')
print('root favicon.ico + favicon-32x32.png in place')

ORG = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "XYNTRIQ",
    "url": "https://xyntriq.in",
    "logo": "https://xyntriq.in/assets/logo-v2.png",
    "image": "https://xyntriq.in/assets/logo-v2.png",
    "description": "XYNTRIQ is an AI data annotation and collection company serving LATAM and India — image, video, text, audio, LiDAR annotation and consented first-person (POV) video datasets.",
    "sameAs": ["https://www.linkedin.com/company/xyntriq"],
    "contactPoint": {"@type": "ContactPoint", "contactType": "sales", "email": "sales@xyntriq.in", "url": "https://xyntriq.in/contact"},
    "address": {"@type": "PostalAddress", "addressCountry": "IN"},
    "knowsAbout": ["Data annotation", "Data collection", "POV video data", "AI training data"]
}
org_ld = '<script type="application/ld+json">\n' + json.dumps(ORG, ensure_ascii=False, indent=2) + '\n</script>'

fav_links = ('<link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32x32.png">\n'
             '<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">')

n_pages = 0
for html in sorted(site.glob('*.html')):
    t = html.read_text(encoding='utf-8')
    orig = t
    # a. png favicon + apple-touch after the svg icon link
    svg = '<link rel="icon" type="image/svg+xml" href="assets/favicon.svg">'
    if svg in t and 'favicon-32x32.png' not in t:
        t = t.replace(svg, svg + '\n' + fav_links, 1)
    # b. Organization schema if missing
    if '"@type": "Organization"' not in t:
        t = t.replace('</head>', org_ld + '\n</head>', 1)
    if t != orig:
        html.write_text(t, encoding='utf-8')
        n_pages += 1
print('pages updated:', n_pages)
