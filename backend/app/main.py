from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.chat import router as chat_router
from app.api.user import router as user_router
from app.api.order import router as order_router
from app.api.payment import router as payment_router

app = FastAPI(title="GenUI Agent", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(user_router)
app.include_router(order_router)
app.include_router(payment_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
