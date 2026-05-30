from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    database_url: str = "postgresql://bei_yangu_admin:1423Okello,@localhost:5501/bei_yangu_db"
    gemini_api_key: str = ""
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    seed_on_startup: bool = True
    seed_force: bool = False

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
