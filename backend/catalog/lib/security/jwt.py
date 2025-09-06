import os
from jose import jwt, JWTError
SECRET = os.getenv("AUTH_SECRET", "dev-secret-change-me")
ALGO = "HS256"
def decode(token: str):
    try:
        return jwt.decode(token, SECRET, algorithms=[ALGO])
    except JWTError:
        return None