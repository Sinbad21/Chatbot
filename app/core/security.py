"""
Security Utilities for ChatBotPlatform

Password hashing and verification using bcrypt.
"""

from passlib.context import CryptContext
import secrets
from typing import Optional

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def generate_secret_key(length: int = 32) -> str:
    """Generate a random secret key"""
    return secrets.token_urlsafe(length)

def generate_jwt_secret() -> str:
    """Generate a JWT secret key"""
    return secrets.token_hex(32)