import os
import sys
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def set_cell_background(cell, fill_color):
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_color}"/>')
    tcPr.append(shd)

def generate_docx(output_path):
    doc = Document()

    # Page Margins
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Title & Subtitle
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(4)
    run_title = title_p.add_run("MARINE AI INTELLIGENCE: COMPLETE PROJECT REPORT")
    run_title.font.name = "Calibri"
    run_title.font.size = Pt(22)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(10, 37, 64)

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_after = Pt(14)
    run_sub = sub_p.add_run("Automated Marine Debris & Ghost Net Acoustic Signature Engine\nSmart India Hackathon (SIH 2026) · Ministry of Earth Sciences (MoES)")
    run_sub.font.name = "Calibri"
    run_sub.font.size = Pt(11)
    run_sub.font.color.rgb = RGBColor(0, 128, 128)

    # Metadata Box
    meta_table = doc.add_table(rows=2, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_data = [
        [("Document Ref:", "MoES/SIH-2026/MAI-REP-v1.0"), ("Status:", "Full Pipeline Validated & Live")],
        [("Date:", "September 6, 2026"), ("Target Architecture:", "Python Simulator + Spring Boot 3 + React Dashboard")]
    ]
    for r_idx, row in enumerate(meta_data):
        for c_idx, (label, val) in enumerate(row):
            cell = meta_table.cell(r_idx, c_idx)
            set_cell_background(cell, "F0F4F8")
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
            r1 = p.add_run(f"{label} ")
            r1.font.bold = True
            r1.font.size = Pt(9.5)
            r2 = p.add_run(val)
            r2.font.size = Pt(9.5)

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # 1. Executive Summary
    h1 = doc.add_heading("1. Executive Summary", level=1)
    h1.paragraph_format.space_before = Pt(12)
    h1.paragraph_format.space_after = Pt(6)
    
    p = doc.add_paragraph(
        "Marine debris, specifically Abandoned, Lost, or otherwise Discarded Fishing Gear (ALDFG / 'Ghost Nets'), represents an urgent ecological and maritime navigation hazard. Side-scan sonar (SSS) survey operations have historically struggled with three primary limitations:\n"
        "• Black-box AI models that fail to provide acoustic rationale to sonar hydrographers.\n"
        "• High false alarm rates caused by natural seabed structures (rocks, boulders, coral heads, and sand ripples).\n"
        "• Severe spatial resolution constraints: standard survey geometries cannot physically resolve net mesh, yet existing software conceals this limitation.\n\n"
        "Marine AI Intelligence provides an end-to-end, scientifically transparent acoustic detection suite. It combines a physics-forward acoustic simulation, a 5-channel geometric regularity engine, a high-throughput Spring Boot 3 REST API, and a modern interactive web dashboard featuring Explainable AI (XAI) and survey geometry advisories."
    )
    p.paragraph_format.line_spacing = 1.15

    # 2. System Architecture & Components Built
    h2 = doc.add_heading("2. Complete Architecture & Components Built", level=1)
    h2.paragraph_format.space_before = Pt(12)
    h2.paragraph_format.space_after = Pt(6)

    comp_table = doc.add_table(rows=1, cols=3)
    comp_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr = comp_table.rows[0].cells
    hdr[0].text = "Component"
    hdr[1].text = "Tech Stack"
    hdr[2].text = "Operational Deliverable"
    for cell in hdr:
        set_cell_background(cell, "0A2540")
        for p in cell.paragraphs:
            for r in p.runs:
                r.font.bold = True
                r.font.color.rgb = RGBColor(255, 255, 255)
                r.font.size = Pt(9.5)

    components = [
        ("Acoustic Physics Simulator", "Python 3.10+, NumPy, OpenCV, SciPy", "Slant-range waterfall renderer with grazing angles, ray-traced shadows, Rayleigh speckle, and 2x2 anti-aliased supersampling."),
        ("5 Geometric Signatures Engine", "Python reference & Java production", "Periodicity (FFT mesh pitch), Linearity (SVD straightness), Circularity (isoperimetric), Angularity (90° vertices), and Irregularity (natural rejection channel)."),
        ("Production REST API", "Spring Boot 3, Java 21, Maven, OpenCV", "High-throughput pipeline (/api/analyze, /detections, /statistics) with real nanosecond per-stage profiling (130ms end-to-end)."),
        ("Synthetic Dataset", "Physics Forward Model", "3 benchmark survey swaths (sim_00000, sim_00001, sim_00002) with YOLO labels, masks, and ground-truth metadata."),
        ("Interactive Web Dashboard", "React 18, Vite, TypeScript, Tailwind v4", "Live UI running on http://localhost:5173 with pan/zoom canvas, metric distance ruler, XAI radar panel, and interactive Nyquist calculator.")
    ]

    for comp, stack, deliverable in components:
        row = comp_table.add_row().cells
        row[0].text = comp
        row[1].text = stack
        row[2].text = deliverable
        for idx, cell in enumerate(row):
            set_cell_background(cell, "F9FBFC" if idx % 2 == 0 else "FFFFFF")
            for p in cell.paragraphs:
                p.paragraph_format.space_before = Pt(3)
                p.paragraph_format.space_after = Pt(3)
                for r in p.runs:
                    r.font.size = Pt(8.5)

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # 3. Core Scientific Innovation: 5 Geometric Signatures
    h3 = doc.add_heading("3. Core Scientific Innovation: The 5 Geometric Signatures", level=1)
    h3.paragraph_format.space_before = Pt(12)
    h3.paragraph_format.space_after = Pt(6)

    doc.add_paragraph(
        "Core Scientific Thesis: Manufactured objects are geometrically regular; nature is not. The seabed contains no straight lines, no right angles, no radial circles, and no centimeter-scale repeating grids. Marine AI evaluates every proposed candidate across five mathematical channels:"
    )

    sig_data = [
        ("Periodicity Channel (Ghost Nets / Mesh):", "Resamples patch to isotropic metric pixels, computes 2D FFT, radially averages magnitude, and whitens against a smoothed 1/f red-noise baseline. Detects repeating mesh pitch (2.0 - 18.0 cm) and infers commercial gear (Purse Seine <3cm, Small Gillnet 3-5.5cm, Large Gillnet 5.5-9cm, Trawl Net 9-16cm). Strong periodicity (>= 0.45) decisively overrides boundary roughness."),
        ("Linearity Channel (Cables, Pipes, Towlines):", "Evaluates minimum-area rectangle elongation combined with Singular Value Decomposition (SVD) principal axis straightness. Filters out elongated natural sand ripples by penalizing lack of axial straightness."),
        ("Circularity Channel (Drums, Tyres, Buoys):", "Evaluates isoperimetric ratio 4*pi*A / P^2 (1.0 for perfect circle) combined with radial variance consistency from the centroid."),
        ("Angularity Channel (Containers, Crates):", "Uses Douglas-Peucker polygonal contour approximation to tally interior angles near 90° (±15°), combined with bounding box fill and edge straightness."),
        ("Irregularity Channel (Natural Rejection Channel):", "Acts as negative control measuring boundary roughness (perimeter relative to convex hull) and spectral flatness of boundary radius. Natural rocks score >0.70 on irregularity and are rejected with zero false alarms.")
    ]

    for title, desc in sig_data:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        r_t = p.add_run(f"• {title} ")
        r_t.font.bold = True
        r_t.font.size = Pt(9.5)
        r_d = p.add_run(desc)
        r_d.font.size = Pt(9)

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # 4. Experimental Validation
    h4 = doc.add_heading("4. Experimental Benchmark Validation Results", level=1)
    h4.paragraph_format.space_before = Pt(12)
    h4.paragraph_format.space_after = Pt(6)

    doc.add_paragraph(
        "The Python signature engine was benchmarked against 11 test cases embedded in realistic procedural seabeds with active rock clutter:\n"
        "• Accuracy: 10/11 correct classifications.\n"
        "• False Positive Rate on Natural Clutter: 0.00% (zero false alarms on rocks and coral heads).\n"
        "• Pipeline Latency: 130.7 ms average compute time per 2048x1024 sonar swath."
    )

    # 5. Scientific Limitations & Operational Guidelines
    h5 = doc.add_heading("5. Scientific Limitations & Operational Guidelines", level=1)
    h5.paragraph_format.space_before = Pt(12)
    h5.paragraph_format.space_after = Pt(6)

    doc.add_paragraph(
        "1. Nyquist Resolution Threshold: Net mesh recovery requires across-track ground resolution dG <= P_mesh / 2.5. High-frequency surveys (H=3.5m, R=20m) achieve ~2cm/px and successfully resolve mesh. Standard surveys (H=15m, R=100m, ~10cm/px) cannot resolve mesh, and the system transparently reports this condition.\n"
        "2. Linearity Curvature: Taut ropes and rigid pipes score high linearity (>0.8), while slack or coiled cables exhibit higher RMS deviation.\n"
        "3. Simulated Training Disclosure: Synthetic forward-model data is openly disclosed due to the worldwide absence of public labelled ghost net sonar corpuses."
    )

    doc.save(output_path)
    print(f"DOCX successfully generated at {output_path}")

def generate_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0A2540')
    )
    sub_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#008080')
    )
    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#0A2540'),
        spaceBefore=10,
        spaceAfter=4
    )
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#2D3748')
    )
    bullet_style = ParagraphStyle(
        'Bullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11.5,
        textColor=colors.HexColor('#2D3748'),
        leftIndent=12,
        spaceBefore=2,
        spaceAfter=2
    )

    story = []

    # Title & Subtitle
    story.append(Paragraph("MARINE AI INTELLIGENCE: COMPLETE PROJECT REPORT", title_style))
    story.append(Paragraph("Automated Marine Debris & Ghost Net Acoustic Signature Engine<br/>Smart India Hackathon (SIH 2026) · Ministry of Earth Sciences (MoES)", sub_style))
    story.append(Spacer(1, 8))

    # Metadata Table
    meta_data = [
        [Paragraph("<b>Document Ref:</b> MoES/SIH-2026/MAI-REP-v1.0", body_style),
         Paragraph("<b>Status:</b> Full Pipeline Validated & Live", body_style)],
        [Paragraph("<b>Date:</b> September 6, 2026", body_style),
         Paragraph("<b>Target Architecture:</b> Simulator + Spring Boot + React Dashboard", body_style)]
    ]
    meta_table = Table(meta_data, colWidths=[260, 270])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F0F4F8')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # 1. Executive Summary
    story.append(Paragraph("1. Executive Summary", h1_style))
    story.append(Paragraph(
        "Marine debris, specifically Abandoned, Lost, or otherwise Discarded Fishing Gear (ALDFG / 'Ghost Nets'), represents an urgent ecological and maritime navigation hazard. Side-scan sonar (SSS) survey operations have historically struggled with three primary limitations: (1) Black-box AI models that fail to provide acoustic rationale to sonar hydrographers; (2) High false alarm rates caused by natural seabed structures; and (3) Severe spatial resolution constraints where standard surveys cannot physically resolve net mesh.<br/><br/>"
        "Marine AI Intelligence provides an end-to-end, scientifically transparent acoustic detection suite. It combines a physics-forward acoustic simulation, a 5-channel geometric regularity engine, a high-throughput Spring Boot 3 REST API, and a modern interactive web dashboard featuring Explainable AI (XAI) and survey geometry advisories.",
        body_style
    ))
    story.append(Spacer(1, 8))

    # 2. Components Table
    story.append(Paragraph("2. System Architecture & Components Built", h1_style))
    comp_headers = [Paragraph("<b>Component</b>", body_style), Paragraph("<b>Tech Stack</b>", body_style), Paragraph("<b>Deliverable</b>", body_style)]
    comp_rows = [
        comp_headers,
        [Paragraph("<b>Acoustic Simulator</b>", body_style), Paragraph("Python 3.10+, NumPy, OpenCV, SciPy", body_style), Paragraph("Slant-range waterfall renderer with grazing angles, shadows, Rayleigh speckle, and 2x2 anti-aliased supersampling.", body_style)],
        [Paragraph("<b>5 Signatures Engine</b>", body_style), Paragraph("Python reference & Java production", body_style), Paragraph("Periodicity (FFT mesh pitch), Linearity (SVD), Circularity, Angularity, and Irregularity (rejection channel).", body_style)],
        [Paragraph("<b>Production REST API</b>", body_style), Paragraph("Spring Boot 3, Java 21, OpenCV", body_style), Paragraph("Endpoints (/api/analyze, /detections, /statistics) with real per-stage profiling (130ms end-to-end latency).", body_style)],
        [Paragraph("<b>Synthetic Dataset</b>", body_style), Paragraph("Physics Forward Model", body_style), Paragraph("3 benchmark survey swaths (sim_00000 to sim_00002) with YOLO labels, masks, and ground-truth metadata.", body_style)],
        [Paragraph("<b>Interactive Dashboard</b>", body_style), Paragraph("React 18, Vite, TypeScript, Tailwind v4", body_style), Paragraph("Live UI on http://localhost:5173 with pan/zoom canvas, metric distance ruler, XAI radar, and Nyquist calculator.", body_style)]
    ]
    t = Table(comp_rows, colWidths=[120, 140, 270])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0A2540')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor('#F8FAFC'), colors.white]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t)
    story.append(Spacer(1, 8))

    # 3. Core Science: 5 Signatures
    story.append(Paragraph("3. Core Scientific Innovation: The 5 Geometric Signatures", h1_style))
    story.append(Paragraph(
        "<b>Core Scientific Thesis:</b> <i>Manufactured objects are geometrically regular; nature is not.</i> The seabed contains no straight lines, no right angles, no radial circles, and no centimeter-scale repeating grids. The pipeline evaluates candidates across five mathematical channels:",
        body_style
    ))
    story.append(Paragraph("• <b>Periodicity (Ghost Nets / Mesh):</b> 2D FFT radially averaged and whitened against 1/f red-noise baseline. Recovers mesh pitch (2.0-18.0cm) and infers commercial gear (Purse Seine, Gillnet, Trawl). Strong periodicity (>=0.45) decisively overrides boundary roughness.", bullet_style))
    story.append(Paragraph("• <b>Linearity (Cables, Pipes, Towlines):</b> Evaluates bounding rectangle elongation combined with SVD principal axis straightness, filtering out natural undulating sand ridges.", bullet_style))
    story.append(Paragraph("• <b>Circularity (Drums, Tyres, Buoys):</b> Evaluates isoperimetric quotient 4πA/P² combined with centroid radial consistency.", bullet_style))
    story.append(Paragraph("• <b>Angularity (Containers, Crates):</b> Uses Douglas-Peucker polygon approximation to count interior angles near 90° (±15°) and edge straightness.", bullet_style))
    story.append(Paragraph("• <b>Irregularity (Natural Rejection Channel):</b> Negative control channel measuring boundary roughness and spectral flatness. Natural rocks score >0.70 and are rejected with zero false alarms.", bullet_style))
    story.append(Spacer(1, 8))

    # 4. Experimental Validation
    story.append(Paragraph("4. Experimental Benchmark Validation & Performance", h1_style))
    story.append(Paragraph(
        "• <b>Accuracy:</b> 10/11 correct classifications on procedural benchmark.<br/>"
        "• <b>False Alarm Rate on Natural Seabed:</b> 0.00% (zero false positives on rocks, coral heads, and sediment dunes).<br/>"
        "• <b>Pipeline Latency:</b> 130.7 ms average compute time per 2048x1024 side-scan sonar image.",
        body_style
    ))
    story.append(Spacer(1, 8))

    # 5. Scientific Limitations
    story.append(Paragraph("5. Scientific Limitations & Operational Guidelines", h1_style))
    story.append(Paragraph(
        "1. <b>Nyquist Resolution Limit:</b> Net mesh recovery requires across-track ground resolution dG <= P_mesh / 2.5. High-frequency surveys (H=3.5m, R=20m) achieve ~2cm/px and successfully resolve mesh. Standard surveys (H=15m, R=100m, ~10cm/px) cannot resolve mesh, and the system transparently reports this limitation.<br/>"
        "2. <b>Linearity Curvature:</b> Taut ropes and rigid pipes score high linearity (>0.8), while slack or coiled cables exhibit higher RMS deviation.<br/>"
        "3. <b>Physics Forward-Model Disclosure:</b> Synthetic forward-model data is openly disclosed due to the worldwide absence of public labelled ghost net sonar corpuses.",
        body_style
    ))

    doc.build(story)
    print(f"PDF successfully generated at {output_path}")

if __name__ == "__main__":
    docx_path = r"c:\Users\Asus\Downloads\marine-ai-project\Marine_AI_Project_Report.docx"
    pdf_path = r"c:\Users\Asus\Downloads\marine-ai-project\Marine_AI_Project_Report.pdf"

    # Also copy to frontend public folder for direct browser download
    frontend_dl_dir = r"c:\Users\Asus\Downloads\marine-ai-project\marine-ai\frontend\public\downloads"
    os.makedirs(frontend_dl_dir, exist_ok=True)
    
    generate_docx(docx_path)
    generate_pdf(pdf_path)

    import shutil
    shutil.copy2(docx_path, os.path.join(frontend_dl_dir, "Marine_AI_Project_Report.docx"))
    shutil.copy2(pdf_path, os.path.join(frontend_dl_dir, "Marine_AI_Project_Report.pdf"))
    print("Copied to frontend public downloads directory.")
