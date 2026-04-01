from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from uuid import UUID


# --------------------------------------------------
# Register
# --------------------------------------------------
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        return v


# --------------------------------------------------
# Login  (form-compatible flat body)
# --------------------------------------------------
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# --------------------------------------------------
# Token response
# --------------------------------------------------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# --------------------------------------------------
# Logged-in user info (returned from /auth/me)
# --------------------------------------------------
class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True
