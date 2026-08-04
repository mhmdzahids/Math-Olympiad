from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, rounds

app = FastAPI(
    title="MathOlympiad API",
    description="Backend untuk platform lomba matematika (auth, quiz, admin).",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(rounds.router)


@app.get("/health", tags=["health"])
def health_check():
    """Dipakai untuk cek server hidup — berguna untuk load-test/monitoring nanti."""
    return {"status": "ok"}
