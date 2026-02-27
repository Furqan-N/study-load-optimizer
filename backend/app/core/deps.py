from typing import Annotated
from uuid import UUID
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from app.db.session import get_db
from app.models.user import User
from app.core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    """Extract, decode, and validate JWT, then return the authenticated user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm],
        )
        subject = payload.get("sub")
        token_user_id = payload.get("user_id")

        if not subject and not token_user_id:
            raise credentials_exception

        user: User | None = None
        if token_user_id:
            try:
                user_uuid = UUID(token_user_id)
            except ValueError:
                raise credentials_exception
            user = db.query(User).filter(User.id == user_uuid).first()
        elif isinstance(subject, str):
            if "@" in subject:
                user = db.query(User).filter(User.email == subject).first()
            else:
                try:
                    user_uuid = UUID(subject)
                except ValueError:
                    raise credentials_exception
                user = db.query(User).filter(User.id == user_uuid).first()
        else:
            raise credentials_exception
    except (JWTError, ValueError):
        raise credentials_exception

    if user is None:
        raise credentials_exception

    return user
