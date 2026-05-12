from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    deepseek_api_key: str = ""
    deepseek_base_url: str = "https://api.deepseek.com/v1"
    deepseek_model: str = "deepseek-chat"

    database_url: str = ""
    redis_url: str = "redis://localhost:6379/0"

    app_secret_key: str = "change-me"
    debug: bool = False


settings = Settings()
