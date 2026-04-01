import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.schemas.auth_schema import UserRegister, UserLogin, Token, UserResponse
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_user

logger = logging.getLogger("wealthlens.auth")

router = APIRouter(prefix="/auth", tags=["Auth"])


# ==================================================
# Register
# ==================================================
@router.post("/register", response_model=UserResponse, status_code=201)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    """
    Create a new user account.
    - Email must be unique.
    - Password is bcrypt-hashed before storage.
    """
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    logger.info(f"New user registered: {user.email} (id={user.id})")
    return user


# ==================================================
# Login
# ==================================================
@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate and return a JWT access token.
    Deliberate vague error message — never reveal whether email or password was wrong.
    """
    user = db.query(User).filter(User.email == payload.email).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive. Please contact support.",
        )

    token = create_access_token(subject=str(user.id))
    logger.info(f"User logged in: {user.email} (id={user.id})")

    return Token(access_token=token)


# ==================================================
# Me — get current logged-in user profile
# ==================================================
@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    """Return the profile of the currently authenticated user."""
    return current_user


# ==================================================
# Logout  (client-side token discard — stateless JWT)
# ==================================================
@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    """
    Stateless logout — the client must discard the JWT.
    This endpoint confirms the token is valid before the client clears it.
    """
    logger.info(f"User logged out: {current_user.email} (id={current_user.id})")
    return {"message": "Logged out successfully. Please discard your token."}
