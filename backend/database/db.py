"""SQLite persistence for loan applications."""
from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

DB_PATH = Path(__file__).resolve().parent / "loans.db"


def get_conn() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with get_conn() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS applications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name TEXT NOT NULL,
                age INTEGER,
                gender TEXT,
                employment_type TEXT,
                years_employment REAL,
                occupation TEXT,
                annual_income REAL,
                monthly_expenses REAL,
                savings REAL,
                bank_balance REAL,
                credit_score REAL,
                existing_loans REAL,
                monthly_emi REAL,
                loan_amount REAL,
                loan_purpose TEXT,
                loan_term INTEGER,
                interest_rate REAL,
                collateral_available INTEGER,
                kpis_json TEXT,
                prediction_json TEXT,
                explanation_json TEXT,
                created_at TEXT,
                updated_at TEXT
            )
            """
        )
        conn.commit()


def _row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    d = dict(row)
    for key in ("kpis_json", "prediction_json", "explanation_json"):
        raw = d.pop(key, None)
        name = key.replace("_json", "")
        d[name] = json.loads(raw) if raw else None
    d["collateral_available"] = bool(d.get("collateral_available"))
    return d


def create_application(payload: dict, kpis: dict, prediction: dict, explanation: dict | None) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    fields = [
        "full_name",
        "age",
        "gender",
        "employment_type",
        "years_employment",
        "occupation",
        "annual_income",
        "monthly_expenses",
        "savings",
        "bank_balance",
        "credit_score",
        "existing_loans",
        "monthly_emi",
        "loan_amount",
        "loan_purpose",
        "loan_term",
        "interest_rate",
        "collateral_available",
    ]
    values = [payload.get(f) for f in fields]
    values[fields.index("collateral_available")] = 1 if payload.get("collateral_available") else 0
    with get_conn() as conn:
        cur = conn.execute(
            f"""
            INSERT INTO applications (
                {", ".join(fields)}, kpis_json, prediction_json, explanation_json, created_at, updated_at
            ) VALUES ({", ".join("?" for _ in fields)}, ?, ?, ?, ?, ?)
            """,
            values
            + [
                json.dumps(kpis),
                json.dumps(prediction),
                json.dumps(explanation or {}),
                now,
                now,
            ],
        )
        conn.commit()
        rid = cur.lastrowid
    return get_application(rid)  # type: ignore


def get_application(app_id: int) -> dict | None:
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM applications WHERE id = ?", (app_id,)).fetchone()
    return _row_to_dict(row) if row else None


def list_applications(
    q: str | None = None,
    risk: str | None = None,
    sort: str = "created_at",
    order: str = "desc",
) -> list[dict]:
    allowed_sort = {
        "created_at",
        "full_name",
        "credit_score",
        "loan_amount",
        "annual_income",
    }
    sort_col = sort if sort in allowed_sort else "created_at"
    ord_sql = "ASC" if order.lower() == "asc" else "DESC"
    sql = "SELECT * FROM applications WHERE 1=1"
    params: list[Any] = []
    if q:
        sql += " AND (full_name LIKE ? OR occupation LIKE ? OR loan_purpose LIKE ?)"
        like = f"%{q}%"
        params.extend([like, like, like])
    sql += f" ORDER BY {sort_col} {ord_sql}"
    with get_conn() as conn:
        rows = conn.execute(sql, params).fetchall()
    items = [_row_to_dict(r) for r in rows]
    if risk:
        items = [
            i
            for i in items
            if (i.get("prediction") or {}).get("risk_category", "").lower() == risk.lower()
        ]
    return items


def update_application(app_id: int, payload: dict, kpis: dict, prediction: dict, explanation: dict | None) -> dict | None:
    if not get_application(app_id):
        return None
    now = datetime.now(timezone.utc).isoformat()
    fields = [
        "full_name",
        "age",
        "gender",
        "employment_type",
        "years_employment",
        "occupation",
        "annual_income",
        "monthly_expenses",
        "savings",
        "bank_balance",
        "credit_score",
        "existing_loans",
        "monthly_emi",
        "loan_amount",
        "loan_purpose",
        "loan_term",
        "interest_rate",
        "collateral_available",
    ]
    sets = ", ".join(f"{f} = ?" for f in fields)
    values = [payload.get(f) for f in fields]
    values[fields.index("collateral_available")] = 1 if payload.get("collateral_available") else 0
    with get_conn() as conn:
        conn.execute(
            f"""
            UPDATE applications SET {sets},
            kpis_json = ?, prediction_json = ?, explanation_json = ?, updated_at = ?
            WHERE id = ?
            """,
            values
            + [
                json.dumps(kpis),
                json.dumps(prediction),
                json.dumps(explanation or {}),
                now,
                app_id,
            ],
        )
        conn.commit()
    return get_application(app_id)


def delete_application(app_id: int) -> bool:
    with get_conn() as conn:
        cur = conn.execute("DELETE FROM applications WHERE id = ?", (app_id,))
        conn.commit()
        return cur.rowcount > 0


def dashboard_stats() -> dict:
    apps = list_applications()
    n = len(apps)
    if n == 0:
        return {
            "total_applications": 0,
            "average_credit_score": 0,
            "average_risk": 0,
            "average_approval_probability": 0,
            "average_debt_ratio": 0,
            "recent": [],
        }
    credits = [a.get("credit_score") or 0 for a in apps]
    risks = [(a.get("prediction") or {}).get("risk_score") or 0 for a in apps]
    probs = [(a.get("prediction") or {}).get("approval_probability") or 0 for a in apps]
    dtis = [(a.get("kpis") or {}).get("debt_to_income_ratio") or 0 for a in apps]
    return {
        "total_applications": n,
        "average_credit_score": round(sum(credits) / n, 2),
        "average_risk": round(sum(risks) / n, 2),
        "average_approval_probability": round(sum(probs) / n, 2),
        "average_debt_ratio": round(sum(dtis) / n, 2),
        "recent": apps[:8],
    }
