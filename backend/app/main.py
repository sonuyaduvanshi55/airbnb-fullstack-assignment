import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import Base, SessionLocal, engine
from .routers import bookings, favorites, host, listings, users
from .seed import seed_database


@asynccontextmanager
async def lifespan(_app: FastAPI):
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_database(db)
    yield


app = FastAPI(
    title="Staybnb API",
    description="FastAPI backend for the Airbnb full-stack assignment.",
    version="1.0.0",
    lifespan=lifespan,
)

origins = [
    item.strip()
    for item in os.getenv("FRONTEND_ORIGINS", "http://localhost:3000").split(",")
    if item.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api")
app.include_router(listings.router, prefix="/api")
app.include_router(bookings.router, prefix="/api")
app.include_router(favorites.router, prefix="/api")
app.include_router(host.router, prefix="/api")


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Staybnb API is running", "docs": "/docs"}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "healthy"}
