import os
import sys
import shutil
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def set_cell_background(cell, fill_color):
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=80, bottom=80, left=120, right=120):
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def generate_docx(output_path):
    doc = Document()
    for section in doc.sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)

    # Title & Subtitle
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(2)
    run_title = title_p.add_run("SEATRACE: MARINE AI INTELLIGENCE")
    run_title.font.name = "Calibri"
    run_title.font.size = Pt(22)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(10, 37, 64)

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_after = Pt(10)
    run_sub = sub_p.add_run("Project Overview, Unique Advantages, Proposed Solution & Tech Stack\nSmart India Hackathon (SIH 2026) · Ministry of Earth Sciences (MoES)")
    run_sub.font.name = "Calibri"
    run_sub.font.size = Pt(11)
    run_sub.font.bold = True
    run_sub.font.color.rgb = RGBColor(0, 128, 128)

    # Metadata Box
    meta_table = doc.add_table(rows=2, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_data = [
        [("Document Type:", "Plain-English Guide & Solution Brief"), ("Audience:", "Evaluators, Team & Stakeholders")],
        [("Core Innovation:", "5-Channel Geometric Regularity (0% False Alarms)"), ("Status:", "Production Ready & Validated")]
    ]
    for r_idx, row in enumerate(meta_data):
        for c_idx, (label, val) in enumerate(row):
            cell = meta_table.cell(r_idx, c_idx)
            set_cell_background(cell, "F0F4F8")
            set_cell_margins(cell, top=50, bottom=50, left=100, right=100)
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(1)
            r1 = p.add_run(f"{label} ")
            r1.font.bold = True
            r1.font.size = Pt(9)
            r1.font.name = "Calibri"
            r2 = p.add_run(val)
            r2.font.size = Pt(9)
            r2.font.name = "Calibri"

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    def add_h1(text):
        h = doc.add_heading(text, level=1)
        h.paragraph_format.space_before = Pt(12)
        h.paragraph_format.space_after = Pt(4)
        for r in h.runs:
            r.font.name = "Calibri"
            r.font.size = Pt(13)
            r.font.bold = True
            r.font.color.rgb = RGBColor(10, 37, 64)
        return h

    # Section 1: What is our project
    add_h1("1. What is Our Project? (In Simple Words)")
    p = doc.add_paragraph(
        "Think of SeaTrace as an \"Ultrasound / X-Ray for the Ocean Floor\" that automatically spots underwater garbage and human-made debris.\n\n"
        "• The Real-World Problem: Millions of tons of dangerous debris are trapped on the ocean seabed — abandoned fishing nets (\"ghost nets\"), sunken cables, oil barrels, and shipping crates. They kill marine animals, destroy coral reefs, and damage ship propellers.\n"
        "• Why Normal Cameras Fail: The ocean floor is pitch black, murky, and muddy. Optical cameras cannot see further than 2 to 3 meters.\n"
        "• Our Sonar Solution: Instead of cameras, boats and underwater robots use Side-Scan Sonar (Sound Waves). The sonar fires acoustic pulses into the water and listens to the returning sound echoes, creating a picture of the seabed.\n"
        "• What Our Software Does: SeaTrace takes these sonar sound pictures, uses AI to automatically detect every piece of human trash, identifies what kind of trash it is, and gives the exact GPS coordinates so salvage divers can pull it out."
    )
    p.paragraph_format.line_spacing = 1.15

    # Section 2: What makes it unique
    add_h1("2. What Makes Our Project UNIQUE? (Comparison with Other Apps)")
    p_lead = doc.add_paragraph("Most other student or research projects simply train basic AI (like YOLO) on normal internet photos. When applied underwater, they fail. Here is how our project is fundamentally different:")
    p_lead.paragraph_format.space_after = Pt(4)

    uniq_table = doc.add_table(rows=1, cols=3)
    uniq_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr = uniq_table.rows[0].cells
    hdr[0].text = "Capability"
    hdr[1].text = "What Other Apps Do"
    hdr[2].text = "What SeaTrace Does Uniquely"
    for c in hdr:
        set_cell_background(c, "0A2540")
        set_cell_margins(c, top=60, bottom=60, left=100, right=100)
        for p in c.paragraphs:
            for r in p.runs:
                r.font.bold = True
                r.font.color.rgb = RGBColor(255, 255, 255)
                r.font.size = Pt(9.5)
                r.font.name = "Calibri"

    uniq_data = [
        ("1. Rock False Alarms", "Confuses rocks and coral with trash (>60% false alarms).", "0.0% False Alarms: Nature makes irregular rocks, humans make geometric shapes. Natural rocks are 100% filtered out."),
        ("2. Multi-Class Scope", "Only searches for ghost nets or surface bottles.", "Detects ALL 4 Major Classes: Nets, Sunken Cables/Pipes, Oil Drums/Barrels, and Cargo Containers."),
        ("3. Model Transparency", "Black-box guessing; outputs a raw percentage with zero proof.", "Explainable AI (XAI): Shows 5-axis radar chart, net mesh grid size (e.g. 5cm gillnet), and shadow height."),
        ("4. Seafloor Measurement", "Draws static boxes with arbitrary pixel numbers.", "Interactive Distance Ruler: Click and drag across any object to measure real length and width in meters."),
        ("5. Processing Speed", "Cloud-dependent and slow (multi-second latency).", "Real-Time Edge Speed: Processes a huge 2048x1024 sonar swath in 130 milliseconds (0.13s) on AUV robots.")
    ]

    for cap, other, seatrace in uniq_data:
        row = uniq_table.add_row().cells
        row[0].text = cap
        row[1].text = other
        row[2].text = seatrace
        for idx, c in enumerate(row):
            set_cell_background(c, "F9FBFC" if idx % 2 == 0 else "FFFFFF")
            set_cell_margins(c, top=50, bottom=50, left=100, right=100)
            for p in c.paragraphs:
                for r in p.runs:
                    r.font.size = Pt(8.5)
                    r.font.name = "Calibri"

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # Section 3: Proposed Solution
    add_h1("3. Proposed Solution (The 4-Step Autonomous Pipeline)")
    p_pipe = doc.add_paragraph(
        "Our proposed solution is an autonomous, end-to-end hydrographic pipeline:\n\n"
        "• Step 1 — Sonar Acoustic Ingestion: An Autonomous Underwater Vehicle (AUV) or survey boat sweeps the ocean floor with high-frequency sound (455/900 kHz), penetrating zero-visibility murky waters up to 100+ meters.\n\n"
        "• Step 2 — Physics Filtering & Cleaning: The system removes acoustic speckle noise and corrects slant-angle distortions caused by sound travelling through water.\n\n"
        "• Step 3 — 5-Channel Geometric Inspection:\n"
        "   - Is it a repeating grid?  -> Classified as Fishing Net (mesh pitch calculated in cm).\n"
        "   - Is it a straight line?   -> Classified as Subsea Cable or Pipeline.\n"
        "   - Is it a smooth circle?   -> Classified as Oil / Chemical Drum.\n"
        "   - Does it have 90° corners? -> Classified as Cargo Container or Box.\n"
        "   - Is it a jagged, rough shape? -> REJECTED (It is a natural rock or coral head).\n\n"
        "• Step 4 — Pinpoint GPS & Salvage Dossier: Calculates towfish layback position to provide exact WGS84 GPS coordinates (accurate to ±0.8 meters) and generates a one-click PDF salvage report for divers."
    )
    p_pipe.paragraph_format.line_spacing = 1.15

    # Section 4: Tech Stack
    add_h1("4. Tech Stack (In Plain English)")
    tech_table = doc.add_table(rows=1, cols=3)
    tech_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr = tech_table.rows[0].cells
    hdr[0].text = "Layer"
    hdr[1].text = "Technology Used"
    hdr[2].text = "Plain-English Purpose"
    for c in hdr:
        set_cell_background(c, "0A2540")
        set_cell_margins(c, top=60, bottom=60, left=100, right=100)
        for p in c.paragraphs:
            for r in p.runs:
                r.font.bold = True
                r.font.color.rgb = RGBColor(255, 255, 255)
                r.font.size = Pt(9.5)
                r.font.name = "Calibri"

    tech_rows = [
        ("Frontend UI", "React 18 & TypeScript", "Builds the fast, responsive interactive website with zero type errors."),
        ("Styling", "Tailwind CSS v4", "Provides modern dark-navy naval theme and crisp light mode."),
        ("3D Graphics", "Three.js / WebGL", "Renders the interactive 3D ocean globe showing debris coordinates around India."),
        ("Backend Server", "Spring Boot 3 (Java 21 LTS)", "Industrial-grade engine that processes sonar imagery in 130ms without memory leaks."),
        ("Computer Vision", "OpenCV (Native C++)", "Detects shapes, lines, circles, contours, and measures shadow heights."),
        ("Acoustic Physics", "Python (NumPy, SciPy)", "Simulates underwater sound physics, reflections, and 2D FFT mesh pitches.")
    ]
    for layer, tech, purp in tech_rows:
        row = tech_table.add_row().cells
        row[0].text = layer
        row[1].text = tech
        row[2].text = purp
        for idx, c in enumerate(row):
            set_cell_background(c, "F9FBFC" if idx % 2 == 0 else "FFFFFF")
            set_cell_margins(c, top=50, bottom=50, left=100, right=100)
            for p in c.paragraphs:
                for r in p.runs:
                    r.font.size = Pt(8.5)
                    r.font.name = "Calibri"

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # Section 5: Elevator Pitch
    add_h1("5. 30-Second Interview / Presentation Pitch")
    box = doc.add_paragraph()
    box.paragraph_format.space_before = Pt(4)
    box.paragraph_format.space_after = Pt(4)
    r_box = box.add_run(
        "\"Our project, SeaTrace, is an autonomous acoustic AI application that finds all types of underwater marine debris — including ghost fishing nets, sunken cables, barrels, and containers — using Side-Scan Sonar instead of optical cameras.\n\n"
        "What makes us unique is that unlike standard AI models that mistake seabed rocks for trash, our 5-channel geometric engine achieves 0.0% false alarms on rocks, runs at real-time speeds (130ms), and provides Explainable AI proof and sub-meter GPS coordinates (±0.8m) so salvage teams can quickly clean up our oceans.\""
    )
    r_box.font.name = "Calibri"
    r_box.font.size = Pt(9.5)
    r_box.font.italic = True
    r_box.font.color.rgb = RGBColor(10, 37, 64)

    doc.save(output_path)
    print(f"DOCX saved at: {output_path}")

def generate_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('DocTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=18, leading=22, textColor=colors.HexColor('#0A2540'))
    sub_style = ParagraphStyle('DocSub', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, leading=13, textColor=colors.HexColor('#008080'))
    h1_style = ParagraphStyle('H1', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=11, leading=14, textColor=colors.HexColor('#0A2540'), spaceBefore=8, spaceAfter=3)
    body_style = ParagraphStyle('Body', parent=styles['Normal'], fontName='Helvetica', fontSize=8, leading=11, textColor=colors.HexColor('#2D3748'))
    body_bold = ParagraphStyle('BodyBold', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8, leading=11, textColor=colors.HexColor('#1A202C'))
    bullet_style = ParagraphStyle('Bullet', parent=styles['Normal'], fontName='Helvetica', fontSize=7.5, leading=10.5, textColor=colors.HexColor('#2D3748'), leftIndent=10, spaceBefore=1, spaceAfter=1)
    table_header = ParagraphStyle('TableHeader', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8, leading=10, textColor=colors.white)

    story = []
    story.append(Paragraph('SEATRACE: MARINE AI INTELLIGENCE', title_style))
    story.append(Spacer(1, 2))
    story.append(Paragraph('PLAIN-ENGLISH PROJECT OVERVIEW, UNIQUE ADVANTAGES & TECH STACK · MoES / SIH 2026', sub_style))
    story.append(Spacer(1, 6))

    # Meta
    meta_data = [
        [Paragraph('<b>Mandate:</b> MoES / SIH 2026 Automated Marine Debris Detection', body_style),
         Paragraph('<b>Document Type:</b> Plain-English Project Brief & Solution Guide', body_style)],
        [Paragraph('<b>Debris Classes:</b> Nets, Cables/Pipes, Drums, Containers', body_style),
         Paragraph('<b>Status:</b> Production Ready & Validated (0.0% Rock False Alarms)', body_style)]
    ]
    meta_table = Table(meta_data, colWidths=[270, 270])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F0F4F8')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 6))

    # 1. What is our project
    story.append(Paragraph('1. What is Our Project? (In Simple Words)', h1_style))
    story.append(Paragraph(
        'Think of <b>SeaTrace</b> as an <i>"Ultrasound / X-Ray for the Ocean Floor"</i> that automatically finds underwater garbage. Millions of tons of dangerous debris (abandoned fishing nets, sunken cables, barrels, crates) are trapped in the ocean, killing marine life. Underwater is pitch black and muddy, so optical cameras fail beyond 2-3 meters. We use <b>Side-Scan Sonar (Sound Waves)</b> instead of light. SeaTrace takes sonar sound pictures, uses AI to automatically detect every piece of human trash, identifies what kind of trash it is, and gives the <b>exact GPS coordinates (±0.8m)</b> so divers can pull it out.',
        body_style
    ))
    story.append(Spacer(1, 6))

    # 2. What makes it unique
    story.append(Paragraph('2. What Makes Our Project UNIQUE? (Comparison with Other Apps)', h1_style))
    uniq_data = [
        [Paragraph('Feature', table_header), Paragraph('What Other Apps Do', table_header), Paragraph('What SeaTrace Does Uniquely', table_header)],
        [Paragraph('1. Rock Alarms', body_bold), Paragraph('Confuses rocks and coral with trash (>60% false alarms)', body_style), Paragraph('<b>0.0% False Alarms:</b> Natural rocks and coral are 100% filtered out', body_style)],
        [Paragraph('2. Debris Scope', body_bold), Paragraph('Only searches for nets or surface bottles', body_style), Paragraph('<b>All 4 Classes:</b> Nets, Cables/Pipes, Oil Drums, and Cargo Containers', body_style)],
        [Paragraph('3. AI Proof', body_bold), Paragraph('Black-box guessing with zero explanation', body_style), Paragraph('<b>Explainable AI (XAI):</b> 5-axis radar chart, net mesh grid size, shadow height', body_style)],
        [Paragraph('4. Measurement', body_bold), Paragraph('Static pixel boxes with no real dimensions', body_style), Paragraph('<b>Interactive Metric Ruler:</b> Click and drag to measure real size in meters', body_style)],
        [Paragraph('5. Speed', body_bold), Paragraph('Cloud-dependent and slow (multi-second lag)', body_style), Paragraph('<b>130ms Real-Time:</b> Runs live inside Autonomous Underwater Vehicles (AUVs)', body_style)]
    ]
    uniq_table = Table(uniq_data, colWidths=[80, 220, 240])
    uniq_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0A2540')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor('#F9FBFC'), colors.white]),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
    ]))
    story.append(uniq_table)
    story.append(Spacer(1, 6))

    # 3. Proposed Solution
    story.append(Paragraph('3. Proposed Solution (The 4-Step Autonomous Pipeline)', h1_style))
    story.append(Paragraph('• <b>Step 1 — Sonar Ingestion:</b> AUV robot shoots high-frequency sound (455/900 kHz) to penetrate zero-visibility waters up to 100m+.', bullet_style))
    story.append(Paragraph('• <b>Step 2 — Physics Cleaning:</b> Corrects sound distortion and cleans acoustic speckle noise.', bullet_style))
    story.append(Paragraph('• <b>Step 3 — 5 Shape Checks:</b> Identifies repeating grids (nets), straight axes (cables/pipes), circles (drums), and right-angle boxes (crates), while rejecting jagged shapes (natural rocks).', bullet_style))
    story.append(Paragraph('• <b>Step 4 — Pinpoint GPS & Salvage Dossier:</b> Computes sub-meter WGS84 GPS (±0.8m) and generates an exportable salvage debrief for divers.', bullet_style))
    story.append(Spacer(1, 6))

    # 4. Tech Stack
    story.append(Paragraph('4. Project Tech Stack (In Plain English)', h1_style))
    tech_data = [
        [Paragraph('Layer', table_header), Paragraph('Technology', table_header), Paragraph('Simple Purpose', table_header)],
        [Paragraph('Frontend UI', body_bold), Paragraph('React 18 & TypeScript', body_style), Paragraph('Fast, modern interactive web interface with zero type errors.', body_style)],
        [Paragraph('Styling', body_bold), Paragraph('Tailwind CSS v4', body_style), Paragraph('Clean naval dark mode and high-contrast light mode styling.', body_style)],
        [Paragraph('3D Graphics', body_bold), Paragraph('Three.js / WebGL', body_style), Paragraph('Interactive 3D ocean globe showing debris coordinates around India.', body_style)],
        [Paragraph('Backend Server', body_bold), Paragraph('Spring Boot 3 (Java 21 LTS)', body_style), Paragraph('High-speed, rock-solid server processing sonar imagery in 130ms.', body_style)],
        [Paragraph('Computer Vision', body_bold), Paragraph('OpenCV (Native C++)', body_style), Paragraph('Detects geometric shapes, lines, circles, and measures shadow heights.', body_style)],
        [Paragraph('Acoustic Physics', body_bold), Paragraph('Python (NumPy, SciPy)', body_style), Paragraph('Simulates how sound bounces on the seabed and calculates mesh frequencies.', body_style)]
    ]
    tech_table = Table(tech_data, colWidths=[80, 160, 300])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0A2540')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor('#F9FBFC'), colors.white]),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
    ]))
    story.append(tech_table)
    story.append(Spacer(1, 6))

    # 5. Elevator Pitch
    story.append(Paragraph('5. 30-Second Interview / Presentation Pitch', h1_style))
    pitch_box = [
        [Paragraph('<i>"Our project, SeaTrace, is an autonomous acoustic AI application that finds all types of underwater marine debris — including ghost fishing nets, sunken cables, barrels, and containers — using Side-Scan Sonar instead of optical cameras.<br/><br/>What makes us unique is that unlike standard AI models that mistake seabed rocks for trash, our 5-channel geometric engine achieves 0.0% false alarms on rocks, runs at real-time speeds (130ms), and provides Explainable AI proof and sub-meter GPS coordinates (±0.8m) so salvage teams can quickly clean up our oceans."</i>', body_style)]
    ]
    pitch_table = Table(pitch_box, colWidths=[540])
    pitch_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#E6FFFA')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#008080')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(pitch_table)

    doc.build(story)
    print(f"PDF saved at: {output_path}")

if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    docx_root = os.path.join(base_dir, "Marine_AI_Simple_Project_Guide.docx")
    pdf_root = os.path.join(base_dir, "Marine_AI_Simple_Project_Guide.pdf")

    generate_docx(docx_root)
    generate_pdf(pdf_root)

    pub_dir = os.path.join(base_dir, "marine-ai", "frontend", "public", "downloads")
    dist_dir = os.path.join(base_dir, "marine-ai", "frontend", "dist", "downloads")
    for d in [pub_dir, dist_dir]:
        if os.path.exists(d):
            shutil.copy2(docx_root, os.path.join(d, "Marine_AI_Simple_Project_Guide.docx"))
            shutil.copy2(pdf_root, os.path.join(d, "Marine_AI_Simple_Project_Guide.pdf"))
            print(f"Copied to: {d}")
