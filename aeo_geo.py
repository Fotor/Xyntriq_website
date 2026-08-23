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

def faq_ld(pairs):
    return ('<script type="application/ld+json">\n' +
            json.dumps({"@context": "https://schema.org", "@type": "FAQPage",
                        "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in pairs]},
                       ensure_ascii=False, indent=2) +
            '\n</script>')

# ---------- index.html: FAQPage JSON-LD (mirror the 10 visible Q&As) + Organization contactPoint ----------
idx = site / 'index.html'
t = idx.read_text(encoding='utf-8')
idx_faq = [
    ("What is data annotation?", "Data annotation is the process of labeling data such as images, video, text, and audio so AI models can learn from it. XYNTRIQ delivers high-accuracy annotation for production-grade models."),
    ("What is first-person (POV) video data collection?", "It records real-world tasks from a person's own point of view using a head-mounted smartphone, producing egocentric video used to train computer-vision models."),
    ("Can I earn money recording videos for AI training?", "Yes. XYNTRIQ compensates contributors for approved video hours, with weekly payouts."),
    ("What is consented AI training data?", "Data collected from people who have explicitly agreed to its use. This is required for ethical, compliant model training."),
    ("What industries do you serve?", "Healthcare and medical imaging, dental, autonomous vehicles, agriculture, geospatial, retail, finance, and more, with domain-matched annotators for each."),
    ("How do you ensure annotation quality?", "Multi-tier QC: guideline-driven labeling, automated validation, expert human review, and batch-level traceability with accuracy reporting."),
    ("How is my data kept secure?", "Every engagement is NDA-first, with controlled access, India data residency, and documented consent management for collected data."),
    ("How do I start a project?", "Contact us with your data and guidelines. We run a small pilot batch first so you can validate accuracy before committing to full production."),
    ("Do you sign NDAs?", "Yes. Every engagement starts with an NDA/MSA covering your data, guidelines, and models, so your information stays confidential from day one."),
    ("How fast can you start?", "As soon as we receive your sample data and guidelines. We run the pilot and return a quote typically within 48 hours of reviewing your batch."),
]
anchor = '    "sameAs": ["https://www.linkedin.com/company/xyntriq"],'
if 'FAQPage' not in t:
    t = t.replace(anchor, anchor + '\n    "contactPoint": {"@type": "ContactPoint", "contactType": "sales", "email": "sales@xyntriq.in", "url": "https://xyntriq.in/contact"},\n    "address": {"@type": "PostalAddress", "addressCountry": "IN"},', 1)
    t = t.replace('</style>\n<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Organization",',
                  '</style>\n<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Organization",', 1) if False else t
    # append FAQPage block right after the Organization script block
    org_end = t.index('</script>', t.index('"@type": "Organization"')) + len('</script>')
    t = t[:org_end] + '\n' + faq_ld(idx_faq) + t[org_end:]
idx.write_text(t, encoding='utf-8')
print('index.html: FAQPage JSON-LD + contactPoint added')

# ---------- services.html: FAQ section + FAQPage JSON-LD + question headings ----------
svc = site / 'services.html'
t = svc.read_text(encoding='utf-8')
svc_faq = [
    ("What data annotation services does XYNTRIQ offer?", "Precision labeling across image, video, text, audio, and 3D — auditable, enterprise-ready, and delivered across every domain."),
    ("How does XYNTRIQ collect custom data?", "Consented, real-world data gathered to your project's specifications — image, video, egocentric (POV), audio, and sensor data collected across LATAM and India."),
    ("How fast can XYNTRIQ start a project?", "Send a sample of your data and we label a test batch, then map your full dataset to the right solution within 48 hours."),
    ("How do engagements work?", "Every engagement starts with a pilot, and there's no long-term lock-in. Pick the engagement model that fits your pipeline."),
]
if 'FAQPage' not in t:
    t = t.replace('</main>', faq_block('Questions, answered', svc_faq) + '\n</main>', 1) if '</main>' in t else t
    t = t.replace('</head>', faq_ld(svc_faq) + '\n</head>', 1)
    t = t.replace('<h2>Custom data, collected right</h2>', '<h2>How does XYNTRIQ collect custom data?</h2>', 1)
    t = t.replace('<h2>Three ways to work with us</h2>', '<h2>What are the ways to work with XYNTRIQ?</h2>', 1)
svc.write_text(t, encoding='utf-8')
print('services.html: FAQ + schema + headings done')

# ---------- industries.html: FAQ section + FAQPage JSON-LD + question heading ----------
ind = site / 'industries.html'
t = ind.read_text(encoding='utf-8')
ind_faq = [
    ("Which industries does XYNTRIQ serve?", "Healthcare and medical imaging, dental, autonomous vehicles, agriculture, geospatial, retail, finance, and more — with domain-matched annotators for each."),
    ("What do real outputs look like?", "Anonymized production samples across industries: annotated imagery, point clouds, and collection footage from projects we've delivered."),
    ("What does annotation look like in motion?", "Real annotation sessions from our production tooling, anonymized for confidentiality."),
    ("How do I start a project with XYNTRIQ?", "Send us a sample of your data and guidelines. We run a small pilot batch first so you can validate accuracy before committing to full production."),
]
if 'FAQPage' not in t:
    t = t.replace('</main>', faq_block('Questions, answered', ind_faq) + '\n</main>', 1) if '</main>' in t else t
    t = t.replace('</head>', faq_ld(ind_faq) + '\n</head>', 1)
    t = t.replace('<h2>Real work, real outputs</h2>', '<h2>What do real outputs look like?</h2>', 1)
ind.write_text(t, encoding='utf-8')
print('industries.html: FAQ + schema + heading done')

# ---------- llms.txt ----------
llms = site / 'llms.txt'
llms.write_text("""# XYNTRIQ

> XYNTRIQ is an AI data annotation and collection company serving LATAM and India — image, video, text, audio, LiDAR annotation and consented first-person (POV) video datasets for production AI models.

## Services
- [Data Annotation](https://xyntriq.in/services): image, video, text, audio, LiDAR, point cloud and multimodal annotation
- [Data Collection](https://xyntriq.in/services): custom image, video, egocentric (POV), audio and sensor data across LATAM and India
- [Video Data (POV)](https://xyntriq.in/video-data): consented first-person video datasets
- [Industries](https://xyntriq.in/industries): healthcare, dental, automotive, agriculture, geospatial, retail, finance
- [Security & Compliance](https://xyntriq.in/security): NDA-first engagements, India data residency, consent management
- [Contributors](https://xyntriq.in/contributors): paid remote contributor program in Latin America

## Key facts
- Pilot-first engagements: a small pilot batch before full production, with a quote typically within 48 hours of reviewing your sample.
- Multi-tier quality control with expert human review and batch-level traceability.
- Every engagement starts with an NDA/MSA.

## Contact
- [Contact page](https://xyntriq.in/contact) | sales@xyntriq.in
""", encoding='utf-8')
print('llms.txt written')

# ---------- robots.txt: reference llms.txt ----------
rob = site / 'robots.txt'
r = rob.read_text(encoding='utf-8')
if 'llms.txt' not in r:
    rob.write_text(r.rstrip() + '\n\n# LLM crawlers: machine-readable summary\n# https://xyntriq.in/llms.txt\n', encoding='utf-8')
    print('robots.txt updated')
print('DONE')
