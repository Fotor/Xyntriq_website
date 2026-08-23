import pathlib, json

site = pathlib.Path(r'C:\Users\Prashant Chaudhary\OneDrive\Documents\Prashant\Agents\Agentic Nikhil\xyntriq-site')

def faq_block(title, pairs):
    details = '\n'.join(
        f'      <details class="faq-item reveal"><summary>{q}</summary><p>{a}</p></details>'
        for q, a in pairs
    )
    return ('<section id="faq" class="alt">\n  <div class="wrap">\n'
            f'    <div class="sec-head reveal"><div class="eyebrow">FAQ</div><h2>{title}</h2></div>\n'
            '    <div class="faq">\n' + details + '\n    </div>\n  </div>\n</section>')

# index.html contactPoint (2-space indent anchor)
idx = site / 'index.html'
t = idx.read_text(encoding='utf-8')
anchor = '  "sameAs": ["https://www.linkedin.com/company/xyntriq"],'
if '"contactType": "sales"' not in t:
    t = t.replace(anchor, anchor + '\n  "contactPoint": {"@type": "ContactPoint", "contactType": "sales", "email": "sales@xyntriq.in", "url": "https://xyntriq.in/contact"},\n  "address": {"@type": "PostalAddress", "addressCountry": "IN"},', 1)
    idx.write_text(t, encoding='utf-8')
    print('index contactPoint fixed')
else:
    print('index contactPoint already present')

# services.html visible FAQ before <footer>
svc = site / 'services.html'
t = svc.read_text(encoding='utf-8')
svc_faq = [
    ("What data annotation services does XYNTRIQ offer?", "Precision labeling across image, video, text, audio, and 3D — auditable, enterprise-ready, and delivered across every domain."),
    ("How does XYNTRIQ collect custom data?", "Consented, real-world data gathered to your project's specifications — image, video, egocentric (POV), audio, and sensor data collected across LATAM and India."),
    ("How fast can XYNTRIQ start a project?", "Send a sample of your data and we label a test batch, then map your full dataset to the right solution within 48 hours."),
    ("How do engagements work?", "Every engagement starts with a pilot, and there's no long-term lock-in. Pick the engagement model that fits your pipeline."),
]
if '<section id="faq" class="alt">' not in t:
    t = t.replace('<footer>', faq_block('Questions, answered', svc_faq) + '\n<footer>', 1)
    svc.write_text(t, encoding='utf-8')
    print('services FAQ section inserted')
else:
    print('services FAQ already present')

ind = site / 'industries.html'
t = ind.read_text(encoding='utf-8')
ind_faq = [
    ("Which industries does XYNTRIQ serve?", "Healthcare and medical imaging, dental, autonomous vehicles, agriculture, geospatial, retail, finance, and more — with domain-matched annotators for each."),
    ("What do real outputs look like?", "Anonymized production samples across industries: annotated imagery, point clouds, and collection footage from projects we've delivered."),
    ("What does annotation look like in motion?", "Real annotation sessions from our production tooling, anonymized for confidentiality."),
    ("How do I start a project with XYNTRIQ?", "Send us a sample of your data and guidelines. We run a small pilot batch first so you can validate accuracy before committing to full production."),
]
if '<section id="faq" class="alt">' not in t:
    t = t.replace('<footer>', faq_block('Questions, answered', ind_faq) + '\n<footer>', 1)
    ind.write_text(t, encoding='utf-8')
    print('industries FAQ section inserted')
else:
    print('industries FAQ already present')
print('DONE2')
