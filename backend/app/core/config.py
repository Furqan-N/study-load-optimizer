from pydantic_settings import BaseSettings
from pydantic import AliasChoices, Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    database_url: str = Field(..., alias="DATABASE_URL")
    secret_key: str = Field(
        ...,
        validation_alias=AliasChoices("SECRET_KEY", "JWT_SECRET"),
    )
    algorithm: str = Field(
        default="HS256",
        validation_alias=AliasChoices("ALGORITHM", "JWT_ALGORITHM"),
    )
    debug: bool = Field(default=False, alias="DEBUG")
    google_api_key: str | None = Field(
        default=None,
        validation_alias=AliasChoices("GOOGLE_API_KEY", "GEMINI_API_KEY"),
    )
    google_model: str = Field(
        default="gemini-2.0-flash",
        validation_alias=AliasChoices("GOOGLE_MODEL", "GEMINI_MODEL"),
    )

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
