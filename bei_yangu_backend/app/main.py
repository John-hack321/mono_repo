from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.routers import home, hospitals, search
from app.seed import seed_database


@asynccontextmanager
async def lifespan(_app: FastAPI):
    Base.metadata.create_all(bind=engine)
    if settings.seed_on_startup:
        db = SessionLocal()
        try:
            stats = seed_database(db)
            if stats:
                print(f"✅ Bei Yangu seed: {stats}")
        finally:
            db.close()
    yield


app = FastAPI(
    title="Bei Yangu API",
    description="Healthcare price transparency platform for Kenya",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(home.router)
app.include_router(hospitals.router)
app.include_router(search.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "bei-yangu-api", "version": "1.0.0"}
