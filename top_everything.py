import pathlib, json

site = pathlib.Path(r'C:\Users\Prashant Chaudhary\OneDrive\Documents\Prashant\Agents\Agentic Nikhil\xyntriq-site')

def faq_block(pairs):
    details = '\n'.join(
        f'      <details class="faq-item reveal"><summary>{q}</summary><p>{a}</p></details>'
        for q, a in pairs
    )
    return ('<section id="faq" class="alt">\n  <div class="wrap">\n'
            '    <div class="sec-head reveal"><div class="eyebrow">FAQ</div><h2>Questions, answered</h2></div>\n'
            '    <div class="faq">\n' + details + '\n    </div>\n  </div>\n</section>')

def faq_ld(pairs):
    return ('<script type="application/ld+json">\n' +
            json.dumps({"@context": "https://schema.org", "@type": "FAQPage",
                        "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in pairs]},
                       ensure_ascii=False, indent=2) +
            '\n</script>')

FAQS = {
    'video-data.html': [
        ("What is egocentric (POV) video data?", "First-person footage recorded from the wearer's own point of view on a head-mounted smartphone — real tasks like cooking, driving, shopping, and household work, everything consented."),
        ("How is POV data collected?", "Contributors record genuine daily activities on their own smartphones with a head mount — nothing staged, everything consented."),
        ("Where does egocentric data go to work?", "Egocentric video trains computer-vision models in robotics, autonomous systems, AR/VR, and retail — wherever a system must understand what a person actually sees and does."),
    ],
    'security.html': [
        ("How does XYNTRIQ protect client data?", "Every engagement is NDA-first with controlled access, India data residency, and documented consent management for collected data."),
        ("What is consent-first collection?", "Data collected from people who have explicitly agreed to its use — required for ethical, compliant model training."),
        ("Can XYNTRIQ be audited by procurement teams?", "Yes. The onboarding and audit path is documented on the security page: easy to onboard, easy to audit, with controls on every engagement."),
    ],
    'sample-data.html': [
        ("What does a XYNTRIQ sample batch include?", "Annotated work by modality plus everything you need to evaluate quality — raw and labeled outputs from production projects, anonymized under NDA."),
        ("Are the samples real production work?", "Yes — no stock renders. These are production samples from projects XYNTRIQ has delivered."),
        ("How do I request a sample batch?", "Send a small sample of your own data; XYNTRIQ returns annotated examples and a fixed-scope quote."),
    ],
    'healthcare-medical.html': [
        ("What does XYNTRIQ annotate in medical imaging?", "Real clinical imaging across modalities, delivered in production work and anonymized under NDA — with annotation and collection across imaging."),
        ("How does XYNTRIQ ensure medical annotation quality?", "Ground truth is expert-validated, consistent, and auditable — because a missed finding or a mislabeled organ is a clinical risk, not a bug report."),
        ("Does XYNTRIQ work with regulated, risk-averse buyers?", "Yes — the controls page documents a setup built for regulated buyers, and a pilot on your own data is the standard first step."),
    ],
    'automotive-robotics.html': [
        ("What data does XYNTRIQ produce for autonomous systems?", "Diverse, real-scene data — edge cases and real-world perception data that close the gaps where autonomous systems fail."),
        ("Why is real-world data needed for perception?", "Autonomous systems fail on what they haven't seen; real-scene, consented data from XYNTRIQ's collection network reduces those gaps."),
        ("Where does this data go to work?", "Into perception stacks for autonomous vehicles and robotics — the use cases are detailed on the page, from edge-case coverage to production datasets."),
    ],
    'geospatial-remote-sensing.html': [
        ("What does XYNTRIQ annotate in geospatial data?", "Satellite scenes, segmentation, and labeling for remote sensing — delivered as real annotated imagery."),
        ("Are the geospatial samples real?", "Yes — anonymized samples from production geospatial work, not stock renders."),
        ("How do I test XYNTRIQ on my own imagery?", "Send a sample of your scenes; XYNTRIQ returns labeled examples and a fixed-scope quote."),
    ],
    'agriculture-farming.html': [
        ("What does XYNTRIQ annotate in agriculture?", "Field imagery and crop data — raw and annotated samples from real agriculture work, anonymized under NDA."),
        ("Are the agriculture samples real?", "Yes — real annotated field imagery from production projects, no stock renders."),
        ("How do I test on my own field data?", "Send a sample of your imagery; XYNTRIQ returns annotated examples and a fixed-scope quote."),
    ],
    'lidar-3d-sensing.html': [
        ("What does XYNTRIQ label in 3D?", "Point-cloud annotation — 3D boxes and segmentation on real LiDAR scenes."),
        ("Are the LiDAR samples real?", "Yes — anonymized point-cloud samples from production LiDAR work."),
        ("How do I test on my own point clouds?", "Send a sample; XYNTRIQ returns labeled examples and a fixed-scope quote."),
    ],
}

for fname, pairs in FAQS.items():
    p = site / fname
    t = p.read_text(encoding='utf-8')
    if '<section id="faq" class="alt">' not in t:
        t = t.replace('<footer>', faq_block(pairs) + '\n<footer>', 1)
        t = t.replace('</head>', faq_ld(pairs) + '\n</head>', 1)
        p.write_text(t, encoding='utf-8')
        print('FAQ added:', fname)
    else:
        print('FAQ already present:', fname)

# defer + version bump for script.js on all pages
n_defer = 0
for html in sorted(site.glob('*.html')):
    t = html.read_text(encoding='utf-8')
    if 'assets/script.js?v=23' in t:
        t = t.replace('<script src="assets/script.js?v=23"></script>', '<script defer src="assets/script.js?v=24"></script>')
        html.write_text(t, encoding='utf-8')
        n_defer += 1
print('pages updated to defer v24:', n_defer)

# canonical for automotive-robotics
ar = site / 'automotive-robotics.html'
t = ar.read_text(encoding='utf-8')
if 'rel="canonical"' not in t:
    t = t.replace('</head>', '<link rel="canonical" href="https://xyntriq.in/automotive-robotics">\n</head>', 1)
    ar.write_text(t, encoding='utf-8')
    print('canonical added: automotive-robotics.html')
print('DONE')
