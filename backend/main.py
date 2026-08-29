"""AI Loan Approval Assistant — FastAPI backend."""
from __future__ import annotations

import csv
import io
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))
load_dotenv(ROOT / ".env")

from api.schemas import AnalyzeIn, ChatIn, LoanApplicationIn, SimulateIn  # noqa: E402
from database.db import (  # noqa: E402
    create_application,
    dashboard_stats,
    delete_application,
    get_application,
    init_db,
    list_applications,
    update_application,
)
from ml.predict import predict_application  # noqa: E402
from utils.calculations import compute_kpis  # noqa: E402
from utils.gemini_service import chat_about_application, explain_application  # noqa: E402
from utils.pdf_report import build_pdf  # noqa: E402

app = FastAPI(
    title="AI Loan Approval Assistant API",
    description="Decision-support API for loan officers. Does not auto-approve loans.",
    version="1.0.0",
)

origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure schema/models exist even when startup hooks are skipped (tests/scripts).
init_db()


@app.on_event("startup")
def startup() -> None:
    init_db()
    from ml.predict import _load

    _load()


@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-loan-approval-assistant"}


@app.get("/api/dashboard")
def dashboard():
    return dashboard_stats()


@app.post("/api/analyze")
def analyze(body: AnalyzeIn):
    payload = body.application.model_dump()
    kpis = compute_kpis(payload)
    prediction = predict_application(payload, kpis)
    explanation = explain_application(payload, kpis, prediction) if body.with_explanation else {}
    if body.persist:
        saved = create_application(payload, kpis, prediction, explanation)
        return saved
    return {"id": None, **payload, "kpis": kpis, "prediction": prediction, "explanation": explanation}


@app.post("/api/simulate")
def simulate(body: SimulateIn):
    payload = body.model_dump()
    kpis = compute_kpis(payload)
    prediction = predict_application(payload, kpis)
    return {"kpis": kpis, "prediction": prediction}


@app.get("/api/applications")
def applications(
    q: str | None = None,
    risk: str | None = None,
    sort: str = "created_at",
    order: str = "desc",
):
    return list_applications(q=q, risk=risk, sort=sort, order=order)


@app.get("/api/applications/{app_id}")
def application_detail(app_id: int):
    row = get_application(app_id)
    if not row:
        raise HTTPException(404, "Application not found")
    return row


@app.put("/api/applications/{app_id}")
def application_update(app_id: int, body: LoanApplicationIn):
    payload = body.model_dump()
    kpis = compute_kpis(payload)
    prediction = predict_application(payload, kpis)
    explanation = explain_application(payload, kpis, prediction)
    row = update_application(app_id, payload, kpis, prediction, explanation)
    if not row:
        raise HTTPException(404, "Application not found")
    return row


@app.delete("/api/applications/{app_id}")
def application_delete(app_id: int):
    if not delete_application(app_id):
        raise HTTPException(404, "Application not found")
    return {"ok": True}


@app.get("/api/applications/{app_id}/pdf")
def application_pdf(app_id: int):
    row = get_application(app_id)
    if not row:
        raise HTTPException(404, "Application not found")
    pdf = build_pdf(row)
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="loan_report_{app_id}.pdf"'},
    )


@app.get("/api/export/csv")
def export_csv():
    rows = list_applications()
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(
        [
            "id",
            "full_name",
            "credit_score",
            "annual_income",
            "loan_amount",
            "approval_probability",
            "risk_score",
            "risk_category",
            "dti",
            "created_at",
        ]
    )
    for r in rows:
        pred = r.get("prediction") or {}
        kpis = r.get("kpis") or {}
        writer.writerow(
            [
                r.get("id"),
                r.get("full_name"),
                r.get("credit_score"),
                r.get("annual_income"),
                r.get("loan_amount"),
                pred.get("approval_probability"),
                pred.get("risk_score"),
                pred.get("risk_category"),
                kpis.get("debt_to_income_ratio"),
                r.get("created_at"),
            ]
        )
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="loan_applications.csv"'},
    )


@app.post("/api/chat")
def chat(body: ChatIn):
    app_data = body.application
    if body.application_id:
        row = get_application(body.application_id)
        if not row:
            raise HTTPException(404, "Application not found")
        app_data = row
    if not app_data:
        raise HTTPException(400, "application_id or application required")
    kpis = app_data.get("kpis") or compute_kpis(app_data)
    prediction = app_data.get("prediction") or predict_application(app_data, kpis)
    explanation = app_data.get("explanation") or explain_application(app_data, kpis, prediction)
    reply = chat_about_application(body.message, app_data, kpis, prediction, explanation)
    return {"reply": reply}


@app.post("/api/kpis")
def kpis_only(body: LoanApplicationIn):
    return compute_kpis(body.model_dump())
