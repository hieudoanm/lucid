#!/usr/bin/env python3

import csv
import json
import sqlite3
import sys
from pathlib import Path


def csv_to_json_and_sqlite(csv_path: str):
    csv_file = Path(csv_path)
    json_file = Path("./json/models.json")
    db_file = Path("./db/models.db")

    rows = []

    # ---- Read CSV ----
    with open(csv_file, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            # normalize types
            row["no"] = int(row["no"]) if row.get("no") else None
            rows.append(row)

    # ---- Write JSON ----
    with open(json_file, "w", encoding="utf-8") as f:
        json.dump(rows, f, indent=2, ensure_ascii=False)

    print(f"✓ JSON written to {json_file}")

    # ---- Write SQLite ----
    conn = sqlite3.connect(db_file)
    cur = conn.cursor()

    # Create table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS models (
            no INTEGER,
            country TEXT,
            company TEXT,
            name TEXT,
            chat TEXT
        )
    """)

    # Optional: clear existing data
    cur.execute("DELETE FROM models")

    # Insert rows
    cur.executemany(
        """
        INSERT INTO models (no, country, company, name, chat)
        VALUES (:no, :country, :company, :name, :chat)
    """,
        rows,
    )

    conn.commit()
    conn.close()

    print(f"✓ SQLite DB written to {db_file}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 convert.py <input.csv>")
        sys.exit(1)

    csv_to_json_and_sqlite(sys.argv[1])
