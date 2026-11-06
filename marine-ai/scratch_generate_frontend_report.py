# -*- coding: utf-8 -*-
"""Generates the Frontend Technology Usage Report (DOCX + PDF).

Every figure in this report was measured directly from the working tree
(package-lock.json, src/, dist/, public/) on 2026-09-07.
"""
import os
import shutil

from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

NAVY = "0A2540"

# ----------------------------------------------------------------------------
# CONTENT (measured facts)
# ----------------------------------------------------------------------------

INTRO = (
    "This report documents every technology actually present in the SeaTrace frontend "
    "(marine-ai/frontend). It is an inventory of what is installed and imported in source, not a "
    "wish-list: each dependency below was resolved from package-lock.json and each usage claim was "
    "verified by searching src/. The application is a single-page React 19 client that renders the "
    "public 'GhostNet' editorial experience and a tactical sonar console from one bundle, and it "
    "runs fully offline against a client-side simulation engine when the Spring Boot backend is "
    "unreachable."
)

RUNTIME_DEPS = [
    ("react", "19.2.8", "runtime",
     "UI runtime. Imported in 32 of 41 source files. Function components only - no class components anywhere in the tree."),
    ("react-dom", "19.2.8", "runtime",
     "DOM renderer. createRoot in src/main.tsx, mounted inside <StrictMode>."),
    ("three", "0.185.1", "runtime",
     "WebGL engine. Used in exactly 2 files - Globe3D.tsx and RealisticOceanGlobe3D.tsx (937 LOC) - for the rotating textured ocean globe (THREE.WebGLRenderer)."),
    ("@types/three", "0.185.4", "runtime",
     "Type definitions for three. Declared as a runtime dependency rather than a devDependency."),
    ("lucide-react", "1.41.0", "runtime",
     "Icon system. The most widely imported third-party package: 29 of 41 files pull icons from it."),
    ("framer-motion", "13.2.0", "runtime",
     "Animation library, used in ONE file: components/ui/number-ticker.tsx (useSpring, useMotionValue, useInView, useReducedMotion). All other motion in the app is hand-written CSS and requestAnimationFrame."),
]

DEV_DEPS = [
    ("vite", "8.2.2", "build",
     "Dev server (port 5173) and production bundler. Configured with an /api proxy to http://localhost:8080 that returns a synthetic 503 JSON body when the backend is down."),
    ("@vitejs/plugin-react", "6.1.1", "build",
     "React Fast Refresh and JSX transform for Vite. Uses the Oxc-based pipeline."),
    ("typescript", "6.0.3", "build",
     "Type checking (tsc -b) ahead of every production build. target es2023, module esnext, moduleResolution bundler, jsx react-jsx, noEmit."),
    ("tailwindcss", "4.3.3", "styling",
     "Utility CSS engine, v4 CSS-first config. No tailwind.config.js exists - the theme lives in an @theme block inside src/index.css."),
    ("@tailwindcss/vite", "4.3.3", "styling",
     "First-party Vite plugin for Tailwind v4; replaces the legacy PostCSS-plugin integration."),
    ("postcss", "8.5.28", "styling", "CSS transform pipeline underneath Tailwind."),
    ("autoprefixer", "10.5.5", "styling", "Vendor-prefixing of generated CSS."),
    ("oxlint", "1.81.0", "quality",
     "Linter (Rust-based, replaces ESLint). Config .oxlintrc.json enables the react, typescript and oxc plugins; rules-of-hooks is set to error."),
    ("playwright", "1.63.0", "testing",
     "Headless browser driver used by three scripts in frontend/scratch/ that launch MS Edge against the dev server and screenshot animations (hero typewriter, entrance dive, ticker)."),
    ("@types/node", "24.13.3", "build", "Node type definitions for vite.config.ts."),
    ("@types/react", "19.2.18", "build", "React type definitions."),
    ("@types/react-dom", "19.2.7", "build", "React DOM type definitions."),
]

NOT_USED = (
    "Deliberately absent: there is no router (react-router), no state-management library (Redux, Zustand, "
    "Jotai), no data-fetching library (React Query, SWR, axios), no component library (MUI, shadcn/ui, Radix), "
    "no charting library (Recharts, Chart.js, D3) and no test runner (Vitest, Jest). "
    "Routing is a useState view switch seeded from URLSearchParams ('?view=console', '?theme=light', "
    "'?assistant=open'); server state is plain fetch() in services/api.ts; every chart in the Explainable AI "
    "panel is hand-computed SVG. The full dependency tree is 133 installed packages, which is unusually small "
    "for an application of this surface area."
)

PLATFORM_APIS = [
    ("HTML5 Canvas 2D", "SonarCanvas.tsx (653 LOC), Globe3D.tsx",
     "Sonar swath rasterisation, pan/zoom, overlay drawing and the 2D fallback globe."),
    ("WebGL via three.js", "Globe3D.tsx, RealisticOceanGlobe3D.tsx",
     "Two THREE.WebGLRenderer instances driving the textured Earth (7 JPG/PNG textures in public/textures)."),
    ("Web Audio API", "AppEntranceDive.tsx, HeroSection.tsx, RealisticOceanGlobe3D.tsx",
     "18 AudioContext call sites synthesising sonar pings and the ambient dive soundscape - no audio files are shipped."),
    ("Web Speech API", "AIAssistantModal.tsx (866 LOC)",
     "5 speechSynthesis call sites give the in-app assistant a spoken voice."),
    ("requestAnimationFrame", "4 call sites across canvas and globe components",
     "Frame loop for the sonar sweep and globe rotation, in place of an animation library."),
    ("ResizeObserver", "2 call sites",
     "Keeps canvas and WebGL viewports in sync with their containers."),
    ("localStorage", "App.tsx",
     "Persists the chosen theme under the key 'ghostnet_theme'."),
    ("AbortController", "services/api.ts",
     "Per-endpoint request timeouts: 1200 ms health, 1500 ms statistics and detections, 3500 ms chat, 8000 ms image analysis."),
    ("FormData and fetch", "services/api.ts, App.tsx",
     "Multipart upload of a sonar image to POST /api/analyze; 6 fetch call sites in total."),
    ("URL.createObjectURL", "UploadModal.tsx",
     "Local preview of the uploaded sonar image before analysis."),
    ("Dynamic import()", "services/api.ts line 107",
     "The 438-LOC conversational engine is code-split and only loaded when the backend chat endpoint fails."),
]

ARCHITECTURE = [
    ("Composition",
     "41 source files, 11,197 lines of TS/TSX/CSS. 36 components split across two suites: components/ghostnet/ (18 files, the public editorial site) and components/ (17 files, the tactical console), plus components/ui/."),
    ("State model",
     "Local React state only - 104 useState, 34 useEffect, 26 useRef, 7 useMemo, 7 useCallback. App.tsx (525 LOC) is the single owner of shared state and passes it down as props. useImperativeHandle exposes SonarCanvasHandle so the parent can drive the canvas."),
    ("Type system",
     "src/types/sonar.ts (153 LOC) is the domain contract: RiskLevel, BBox, StageTiming and five signature-detail interfaces (Periodicity, Linearity, Circularity, Angularity, Irregularity) mirroring the backend classification engine."),
    ("Services layer",
     "Three files. api.ts (110 LOC) is the network boundary; mockEngine.ts (524 LOC) is a full client-side forward model producing detections, statistics and sample history; chatEngine.ts (438 LOC) is the offline assistant."),
    ("Offline-first",
     "Every endpoint follows the same pattern: try the live backend behind an AbortController timeout, fall back silently to the simulation engine, and mark the result isLive:false so the UI can badge it."),
    ("Styling",
     "Tailwind v4 utilities plus 528 lines of hand-written CSS (index.css 344, App.css 184). Theming is CSS custom properties (--accent-neon #00ff88, --bg-main, --card-bg and others) swapped by a body.dark / body.light class, with @custom-variant declarations so Tailwind can target them."),
    ("Typography",
     "Four Google Fonts loaded from index.html with preconnect: Space Grotesk (brand), Plus Jakarta Sans (display and body), Inter (fallback body), JetBrains Mono (telemetry readouts)."),
]

TOP_COMPONENTS = [
    ("ghostnet/RealisticOceanGlobe3D.tsx", "937", "three.js textured Earth with acoustic resonance audio"),
    ("ghostnet/AIAssistantModal.tsx", "866", "In-app assistant UI with speech synthesis"),
    ("SonarCanvas.tsx", "653", "Canvas 2D sonar viewer: pan, zoom, overlays, ruler"),
    ("ghostnet/UploadModal.tsx", "545", "Sonar image upload, preview and dispatch"),
    ("App.tsx", "525", "Root state owner and view switch"),
    ("services/mockEngine.ts", "524", "Client-side detection simulation and sample datasets"),
    ("ghostnet/BeginnerEducationSection.tsx", "479", "Explanatory ghost-net content for non-experts"),
    ("services/chatEngine.ts", "438", "Offline conversational engine (code-split)"),
    ("ghostnet/SonarAnalysisViewer.tsx", "425", "Public-facing analysis walkthrough"),
    ("ghostnet/GlobalOceanMap.tsx", "374", "Global detection map"),
]

BUILD_ROWS = [
    ("index-*.js", "1,074,471 B (1.02 MB)", "Main bundle. three.js and framer-motion dominate this figure."),
    ("index-*.css", "141,184 B (137.9 KB)", "Tailwind output plus the hand-written ocean and sonar CSS."),
    ("chatEngine-*.js", "14,172 B (13.8 KB)", "The one code-split chunk, loaded on demand."),
    ("public/ assets", "29 MB", "7 Earth textures, 11 sample sonar PNGs with paired JSON ground truth, 4 downloadable reports, favicon and icon sprite."),
    ("dist/ total", "30 MB", "Static output - deployable to any CDN or static host; no Node server required."),
]

OBSERVATIONS = [
    ("framer-motion earns 1 file out of 41.",
     "The whole package ships in the main bundle to animate a number ticker. Either replace it with a requestAnimationFrame tween (the codebase already does this everywhere else) or code-split number-ticker.tsx."),
    ("The bundle is a single 1.02 MB chunk.",
     "three.js is imported statically in two components even though the globe is below the fold. A React.lazy boundary around Globe3D and RealisticOceanGlobe3D would move roughly 600 KB off the critical path."),
    ("@types/three sits in dependencies.",
     "Type-only packages belong in devDependencies; it does not affect the bundle but it does affect install size."),
    ("There is no automated test suite.",
     "Playwright is installed, but the three scripts in scratch/ are screenshot probes with hard-coded absolute paths, not assertions. No test runner is configured."),
    ("public/ is 29 MB of unoptimised assets.",
     "The Earth textures are JPG and PNG; converting them to WebP or AVIF would cut first-load weight substantially for the globe."),
]

PIPELINE = (
    "Build command: tsc -b && vite build. Dev: vite on port 5173 with the /api proxy pointed at the Spring Boot "
    "service on port 8080. Lint: oxlint. The proxy has a custom error handler that answers with "
    "{ error: 'Backend offline', fallback: true } and HTTP 503 instead of a connection reset, so the frontend "
    "fallback path is exercised the same way in development as in production."
)

VERSION_NOTE = (
    "All version numbers are the resolved versions from package-lock.json, which differ in places from the "
    "semver ranges in package.json (oxlint resolves to 1.81.0, typescript to 6.0.3, @vitejs/plugin-react to "
    "6.1.1, @types/react-dom to 19.2.7)."
)


# ----------------------------------------------------------------------------
# DOCX
# ----------------------------------------------------------------------------

def set_cell_background(cell, fill_color):
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml('<w:shd {} w:fill="{}"/>'.format(nsdecls("w"), fill_color))
    tcPr.append(shd)


def add_table(doc, headers, rows, widths=None):
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr = table.rows[0].cells
    for i, h in enumerate(headers):
        hdr[i].text = h
        set_cell_background(hdr[i], NAVY)
        for p in hdr[i].paragraphs:
            for r in p.runs:
                r.font.bold = True
                r.font.color.rgb = RGBColor(255, 255, 255)
                r.font.size = Pt(9.5)

    for idx, data in enumerate(rows):
        cells = table.add_row().cells
        for i, val in enumerate(data):
            cells[i].text = val
            set_cell_background(cells[i], "F9FBFC" if idx % 2 == 0 else "FFFFFF")
            for p in cells[i].paragraphs:
                p.paragraph_format.space_before = Pt(2)
                p.paragraph_format.space_after = Pt(2)
                for r in p.runs:
                    r.font.size = Pt(8.5)

    if widths:
        for row in table.rows:
            for i, w in enumerate(widths):
                row.cells[i].width = Inches(w)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)
    return table


def add_bullets(doc, items):
    for label, text in items:
        p = doc.add_paragraph(style="List Bullet")
        r = p.add_run(label + " ")
        r.font.bold = True
        r.font.size = Pt(9.5)
        r2 = p.add_run(text)
        r2.font.size = Pt(9.5)


def generate_docx(output_path):
    doc = Document()
    for section in doc.sections:
        section.top_margin = Inches(0.7)
        section.bottom_margin = Inches(0.7)
        section.left_margin = Inches(0.7)
        section.right_margin = Inches(0.7)

    p_title = doc.add_paragraph()
    r_title = p_title.add_run("SEATRACE FRONTEND: TECHNOLOGY USAGE REPORT")
    r_title.font.name = "Calibri"
    r_title.font.size = Pt(20)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(10, 37, 64)

    p_sub = doc.add_paragraph()
    r_sub = p_sub.add_run(
        "Verified inventory of every library, browser API and build tool used in marine-ai/frontend\n"
        "Smart India Hackathon (SIH 2026) \u00b7 Ministry of Earth Sciences (MoES)"
    )
    r_sub.font.name = "Calibri"
    r_sub.font.size = Pt(11)
    r_sub.font.color.rgb = RGBColor(0, 128, 128)

    meta_table = doc.add_table(rows=2, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_data = [
        [("Document Ref:", "MoES/SIH-2026/FRONTEND-STACK-v1.0"), ("Scope:", "marine-ai/frontend only")],
        [("Date:", "September 7, 2026"), ("Basis:", "package-lock.json plus static analysis of src/ and dist/")],
    ]
    for r_idx, row in enumerate(meta_data):
        for c_idx, (label, val) in enumerate(row):
            cell = meta_table.cell(r_idx, c_idx)
            set_cell_background(cell, "F0F4F8")
            p = cell.paragraphs[0]
            r1 = p.add_run(label + " ")
            r1.font.bold = True
            r1.font.size = Pt(9)
            r2 = p.add_run(val)
            r2.font.size = Pt(9)
    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    doc.add_heading("1. Summary", level=1)
    doc.add_paragraph(INTRO)

    doc.add_heading("2. Runtime Dependencies (shipped to the browser)", level=1)
    add_table(doc, ["Package", "Version", "Role", "How it is actually used"],
              [list(r) for r in RUNTIME_DEPS], widths=[1.2, 0.75, 0.7, 4.5])

    doc.add_heading("3. Build, Styling and Quality Toolchain (dev only)", level=1)
    add_table(doc, ["Package", "Version", "Role", "How it is actually used"],
              [list(r) for r in DEV_DEPS], widths=[1.2, 0.75, 0.7, 4.5])

    doc.add_heading("4. What Is Deliberately Not Used", level=1)
    doc.add_paragraph(NOT_USED)

    doc.add_heading("5. Native Browser Platform APIs", level=1)
    doc.add_paragraph(
        "A large share of this frontend's capability comes from the platform rather than from packages. "
        "The following APIs are called directly:"
    )
    add_table(doc, ["Platform API", "Where", "Purpose"],
              [list(r) for r in PLATFORM_APIS], widths=[1.5, 2.0, 3.6])

    doc.add_heading("6. Application Architecture", level=1)
    add_bullets(doc, [(label + ":", text) for label, text in ARCHITECTURE])

    doc.add_heading("7. Largest Components by Line Count", level=1)
    add_table(doc, ["Component", "LOC", "Responsibility"],
              [list(r) for r in TOP_COMPONENTS], widths=[2.6, 0.6, 3.9])

    doc.add_heading("8. Build Output and Weight", level=1)
    add_table(doc, ["Artefact", "Size", "Notes"],
              [list(r) for r in BUILD_ROWS], widths=[1.6, 1.4, 4.1])
    doc.add_paragraph(PIPELINE)

    doc.add_heading("9. Observations and Recommended Next Steps", level=1)
    add_bullets(doc, OBSERVATIONS)

    note = doc.add_paragraph()
    nr = note.add_run(VERSION_NOTE)
    nr.font.size = Pt(8)
    nr.font.color.rgb = RGBColor(100, 116, 139)
    nr.italic = True
    note.alignment = WD_ALIGN_PARAGRAPH.LEFT

    doc.save(output_path)
    print("DOCX generated: " + output_path)


# ----------------------------------------------------------------------------
# PDF
# ----------------------------------------------------------------------------

def generate_pdf(output_path):
    doc = SimpleDocTemplate(output_path, pagesize=letter,
                            rightMargin=32, leftMargin=32, topMargin=32, bottomMargin=32)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('DocTitle', parent=styles['Normal'], fontName='Helvetica-Bold',
                                 fontSize=15, leading=19, textColor=colors.HexColor('#0A2540'))
    sub_style = ParagraphStyle('DocSub', parent=styles['Normal'], fontName='Helvetica',
                               fontSize=9, leading=12.5, textColor=colors.HexColor('#008080'))
    h1_style = ParagraphStyle('H1', parent=styles['Heading1'], fontName='Helvetica-Bold',
                              fontSize=11, leading=15, textColor=colors.HexColor('#0A2540'),
                              spaceBefore=9, spaceAfter=3)
    body_style = ParagraphStyle('Body', parent=styles['Normal'], fontName='Helvetica',
                                fontSize=7.6, leading=10.2, textColor=colors.HexColor('#2D3748'))
    note_style = ParagraphStyle('Note', parent=body_style, fontSize=7,
                                textColor=colors.HexColor('#64748B'))

    def P(t):
        return Paragraph(t, body_style)

    def esc(t):
        return t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

    def table(headers, rows, widths):
        data = [[Paragraph("<b>" + esc(h) + "</b>", body_style) for h in headers]]
        data += [[P(esc(c)) for c in row] for row in rows]
        t = Table(data, colWidths=widths, repeatRows=1)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0A2540')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#F8FAFC'), colors.white]),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 2.5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ]))
        return t

    story = []
    story.append(Paragraph("SEATRACE FRONTEND: TECHNOLOGY USAGE REPORT", title_style))
    story.append(Paragraph(
        "Verified inventory of every library, browser API and build tool used in marine-ai/frontend<br/>"
        "Smart India Hackathon (SIH 2026) &middot; Ministry of Earth Sciences (MoES)", sub_style))
    story.append(Spacer(1, 6))

    meta = Table([
        [P("<b>Document Ref:</b> MoES/SIH-2026/FRONTEND-STACK-v1.0"), P("<b>Scope:</b> marine-ai/frontend only")],
        [P("<b>Date:</b> September 7, 2026"), P("<b>Basis:</b> package-lock.json plus static analysis of src/ and dist/")],
    ], colWidths=[270, 278])
    meta.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F0F4F8')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E0')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E0')),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
    ]))
    story.append(meta)
    story.append(Spacer(1, 6))

    story.append(Paragraph("1. Summary", h1_style))
    story.append(P(esc(INTRO)))
    story.append(Spacer(1, 4))

    story.append(Paragraph("2. Runtime Dependencies (shipped to the browser)", h1_style))
    story.append(table(["Package", "Version", "Role", "How it is actually used"],
                       [list(r) for r in RUNTIME_DEPS], [88, 52, 46, 362]))
    story.append(Spacer(1, 4))

    story.append(Paragraph("3. Build, Styling and Quality Toolchain (dev only)", h1_style))
    story.append(table(["Package", "Version", "Role", "How it is actually used"],
                       [list(r) for r in DEV_DEPS], [88, 52, 46, 362]))
    story.append(Spacer(1, 4))

    story.append(Paragraph("4. What Is Deliberately Not Used", h1_style))
    story.append(P(esc(NOT_USED)))
    story.append(Spacer(1, 4))

    story.append(Paragraph("5. Native Browser Platform APIs", h1_style))
    story.append(table(["Platform API", "Where", "Purpose"],
                       [list(r) for r in PLATFORM_APIS], [104, 150, 294]))
    story.append(Spacer(1, 4))

    story.append(Paragraph("6. Application Architecture", h1_style))
    for label, text in ARCHITECTURE:
        story.append(P("&bull; <b>" + esc(label) + ":</b> " + esc(text)))
    story.append(Spacer(1, 4))

    story.append(Paragraph("7. Largest Components by Line Count", h1_style))
    story.append(table(["Component", "LOC", "Responsibility"],
                       [list(r) for r in TOP_COMPONENTS], [178, 42, 328]))
    story.append(Spacer(1, 4))

    story.append(Paragraph("8. Build Output and Weight", h1_style))
    story.append(table(["Artefact", "Size", "Notes"],
                       [list(r) for r in BUILD_ROWS], [110, 105, 333]))
    story.append(Spacer(1, 3))
    story.append(P(esc(PIPELINE)))
    story.append(Spacer(1, 4))

    story.append(Paragraph("9. Observations and Recommended Next Steps", h1_style))
    for finding, action in OBSERVATIONS:
        story.append(P("&bull; <b>" + esc(finding) + "</b> " + esc(action)))
    story.append(Spacer(1, 6))
    story.append(Paragraph("<i>" + esc(VERSION_NOTE) + "</i>", note_style))

    doc.build(story)
    print("PDF generated: " + output_path)


if __name__ == "__main__":
    root = r"c:\Users\Asus\Downloads\marine-ai-project"
    docx_path = os.path.join(root, "Marine_AI_Frontend_Report.docx")
    pdf_path = os.path.join(root, "Marine_AI_Frontend_Report.pdf")
    dl_dir = os.path.join(root, "marine-ai", "frontend", "public", "downloads")
    os.makedirs(dl_dir, exist_ok=True)

    generate_docx(docx_path)
    generate_pdf(pdf_path)

    shutil.copy2(docx_path, os.path.join(dl_dir, "Marine_AI_Frontend_Report.docx"))
    shutil.copy2(pdf_path, os.path.join(dl_dir, "Marine_AI_Frontend_Report.pdf"))
    print("Copied to frontend/public/downloads/")
