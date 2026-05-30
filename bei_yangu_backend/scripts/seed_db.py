#!/usr/bin/env python3
"""Repopulate the database with Faker-generated Kenyan healthcare data.

Usage (from bei_yangu_backend/):
  python scripts/seed_db.py
  python scripts/seed_db.py --extra-hospitals 20
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.database import Base, SessionLocal, engine  # noqa: E402
from app.seed_faker import seed_with_faker  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed Bei Yangu database with Faker data")
    parser.add_argument(
        "--extra-hospitals",
        type=int,
        default=8,
        help="Additional Kenyan county/mission facilities beyond the main catalogue",
    )
    args = parser.parse_args()

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        stats = seed_with_faker(db, extra_hospitals=args.extra_hospitals)
        print("Database seeded successfully:")
        for key, val in stats.items():
            print(f"  {key}: {val}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
