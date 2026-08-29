"""Professional PDF loan assessment reports via ReportLab."""
from __future__ import annotations

from datetime import datetime, timezone
from io import BytesIO
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

REPORTS = Path(__file__).resolve().parent.parent / "reports"
NAVY = colors.Color(0.05, 0.15, 0.35)
ROYAL = colors.Color(0.15, 0.35, 0.75)
LIGHT = colors.Color(0.95, 0.96, 0.98)


def build_pdf(app: dict) -> bytes:
    REPORTS.mkdir(parents=True, exist_ok=True)
    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    title = ParagraphStyle("T", parent=styles["Heading1"], textColor=NAVY, alignment=TA_CENTER, fontSize=18)
    h2 = ParagraphStyle("H2", parent=styles["Heading2"], textColor=ROYAL, fontSize=13, spaceBefore=12)
    body = ParagraphStyle("B", parent=styles["Normal"], fontSize=10, leading=14, alignment=TA_LEFT)
    small = ParagraphStyle("S", parent=styles["Normal"], fontSize=8, textColor=colors.grey)

    kpis = app.get("kpis") or {}
    pred = app.get("prediction") or {}
    exp = app.get("explanation") or {}
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    story = [
        Paragraph("AI Loan Approval Assistant", title),
        Paragraph("Confidential Credit Decision Support Report", body),
        Paragraph(f"Generated: {ts} &nbsp;|&nbsp; Application ID: {app.get('id', '—')}", small),
        Spacer(1, 0.2 * inch),
        Paragraph("1. Customer Summary", h2),
    ]

    summary_data = [
        ["Full Name", str(app.get("full_name", "")), "Age", str(app.get("age", ""))],
        ["Occupation", str(app.get("occupation", "")), "Employment", str(app.get("employment_type", ""))],
        ["Annual Income", f"${app.get('annual_income', 0):,.2f}", "Credit Score", str(app.get("credit_score", ""))],
        ["Loan Amount", f"${app.get('loan_amount', 0):,.2f}", "Purpose", str(app.get("loan_purpose", ""))],
        ["Term (months)", str(app.get("loan_term", "")), "Interest Rate", f"{app.get('interest_rate', 0)}%"],
        ["Collateral", "Yes" if app.get("collateral_available") else "No", "Gender", str(app.get("gender", ""))],
    ]
    t = Table(summary_data, colWidths=[1.3 * inch, 2.1 * inch, 1.3 * inch, 2.1 * inch])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), LIGHT),
                ("BACKGROUND", (2, 0), (2, -1), LIGHT),
                ("TEXTCOLOR", (0, 0), (-1, -1), NAVY),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.Color(0.8, 0.85, 0.9)),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    story += [t, Paragraph("2. Financial Metrics (KPIs)", h2)]

    kpi_rows = [
        ["Metric", "Value"],
        ["Debt-to-Income Ratio", f"{kpis.get('debt_to_income_ratio', 0)}%"],
        ["Loan-to-Income Ratio", f"{kpis.get('loan_to_income_ratio', 0)}%"],
        ["Disposable Income (mo)", f"${kpis.get('disposable_income', 0):,.2f}"],
        ["Savings Ratio", f"{kpis.get('savings_ratio', 0)}%"],
        ["Credit Utilization (proxy)", f"{kpis.get('credit_utilization', 0)}%"],
        ["Financial Stability Score", f"{kpis.get('financial_stability_score', 0)}"],
        ["Calculated EMI", f"${kpis.get('calculated_emi', 0):,.2f}"],
        ["Affordability Index", f"{kpis.get('loan_affordability_index', 0)}"],
    ]
    kt = Table(kpi_rows, colWidths=[3.5 * inch, 3.3 * inch])
    kt.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("BACKGROUND", (0, 1), (-1, -1), colors.white),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT]),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.Color(0.8, 0.85, 0.9)),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    story += [kt, Paragraph("3. Model Prediction", h2)]
    story.append(
        Paragraph(
            f"Approval Probability: <b>{pred.get('approval_probability', 0)}%</b> &nbsp;|&nbsp; "
            f"Risk Score: <b>{pred.get('risk_score', 0)}</b> &nbsp;|&nbsp; "
            f"Category: <b>{pred.get('risk_category', 'N/A')}</b> &nbsp;|&nbsp; "
            f"Model: {pred.get('model_used', 'N/A')}",
            body,
        )
    )
    story.append(Paragraph(str(pred.get("decision_support", "")), small))
    story.append(Paragraph("4. AI Explanation & Recommendations", h2))
    story.append(Paragraph(f"<b>Executive Summary:</b> {exp.get('executive_summary', '')}", body))
    story.append(Spacer(1, 6))
    story.append(Paragraph(f"<b>Reasoning:</b> {exp.get('reasoning', '')}", body))
    for label, key in [("Strengths", "strengths"), ("Weaknesses", "weaknesses"), ("Potential Risks", "potential_risks")]:
        items = exp.get(key) or []
        if isinstance(items, list):
            story.append(Paragraph(f"<b>{label}:</b> " + "; ".join(str(i) for i in items), body))
        else:
            story.append(Paragraph(f"<b>{label}:</b> {items}", body))
    story.append(Paragraph(f"<b>Business Recommendation:</b> {exp.get('business_recommendation', '')}", body))
    story.append(
        Paragraph(
            f"Suggested Loan Amount: <b>${float(exp.get('suggested_loan_amount') or 0):,.2f}</b> &nbsp; "
            f"Suggested Rate: <b>{exp.get('suggested_interest_rate', '—')}%</b>",
            body,
        )
    )
    story.append(Paragraph(f"<b>Loan Officer Notes:</b> {exp.get('loan_officer_notes', '')}", body))
    story.append(Spacer(1, 0.3 * inch))
    story.append(
        Paragraph(
            "Disclaimer: This report is generated for internal decision support only and does not constitute "
            "an automated loan approval or rejection. Final decisions remain with authorized credit officers.",
            small,
        )
    )
    doc.build(story)
    return buf.getvalue()
