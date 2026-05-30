from sqlalchemy.orm import Session

from app.config import settings
from app.seed_faker import seed_with_faker


def seed_database(db: Session, *, force: bool = False) -> dict[str, int] | None:
    """
    Populate DB on startup when empty, or when force=True / SEED_FORCE=true.
    Uses Faker for realistic Kenyan healthcare data.
    """
    from app.models import Hospital

    if not force and not settings.seed_force and db.query(Hospital).first():
        return None
    return seed_with_faker(db)
