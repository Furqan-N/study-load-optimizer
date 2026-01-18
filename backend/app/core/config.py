from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    database_url: str = Field(..., alias="DATABASE_URL")
    jwt_secret: str = Field(..., alias="JWT_SECRET")
    debug: bool = Field(default=False, alias="DEBUG")

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
