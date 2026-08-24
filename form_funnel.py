import pathlib

site = pathlib.Path(r'C:\Users\Prashant Chaudhary\OneDrive\Documents\Prashant\Agents\Agentic Nikhil\xyntriq-site')
NEW = 'https://forms.gle/44TEJ2htNGxpaQpW9'

repls = [
    # Discord invite -> new registration form
    ('https://discord.gg/4yP2GXvaPe', NEW),
    # old pre-signup form -> new registration form
    ('https://forms.gle/Zqn4Un5vjpJXoVNB7', NEW),
    # launch-bar button label
    ('>Join Discord</a>', '>Register Now</a>'),
    # launch-bar text (index + contributors)
    ('XYNTRIQ app launching across India &amp; LATAM. Join our Discord for early access and launch details',
     'XYNTRIQ app launching across India &amp; LATAM. Register for early access and launch details'),
    ('XYNTRIQ app launching across India & LATAM. Join our Discord for early access and launch details',
     'XYNTRIQ app launching across India & LATAM. Register for early access and launch details'),
]
n = 0
for html in sorted(site.glob('*.html')):
    t = html.read_text(encoding='utf-8')
    orig = t
    for a, b in repls:
        t = t.replace(a, b)
    if t != orig:
        html.write_text(t, encoding='utf-8')
        n += 1
        print('updated:', html.name)
print('pages updated:', n)

# verify no discord/old-form left in visible content
left = []
for html in sorted(site.glob('*.html')):
    t = html.read_text(encoding='utf-8')
    if 'discord.gg/4yP2GXvaPe' in t or 'Zqn4Un5vjpJXoVNB7' in t:
        left.append(html.name)
print('pages still containing old links:', left)
