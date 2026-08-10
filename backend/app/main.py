from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.config import settings
from app.routers import auth, rounds
from app.limiter import limiter

app = FastAPI(
    title="MathOlympiad API",
    description="Backend untuk platform lomba matematika (auth, quiz, admin).",
    version="0.1.0",
)

app.state.limiter = limiter

@app.exception_handler(RateLimitExceeded)
async def custom_rate_limit_handler(request, exc):
    return JSONResponse(
        status_code=429,
        content={"detail": "Terlalu banyak percobaan, silakan coba lagi sebentar lagi."}
    )

app.add_middleware(SlowAPIMiddleware)

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
