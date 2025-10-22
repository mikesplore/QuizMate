import os
import json
from dotenv import load_dotenv
from typing import List

load_dotenv()


def _parse_list_env(value: str, default: List[str]) -> List[str]:
    """Parse environment variable that may be a JSON array or a comma-separated string.

    Returns a list of stripped strings.
    """
    if value is None:
        return default

    value = value.strip()
    if not value:
        return default

    # Try JSON array first
    try:
        parsed = json.loads(value)
        if isinstance(parsed, list):
            return [str(x).strip() for x in parsed if x is not None]
    except Exception:
        pass

    # Fallback: comma-separated
    return [p.strip() for p in value.split(",") if p.strip()]


class Settings:
    """Simple settings container that reads environment variables directly.

    We avoid using pydantic BaseSettings here because the pydantic settings
    loader attempts to decode complex types (like lists) from environment
    values using JSON, which raises when values are plain comma-separated
    strings. This class reads raw env vars and uses a helper to parse lists.
    """

    def __init__(self) -> None:
        # API Configuration
        self.gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
        self.backend_host: str = os.getenv("BACKEND_HOST", "0.0.0.0")
        try:
            self.backend_port: int = int(os.getenv("BACKEND_PORT", "8000"))
        except ValueError:
            self.backend_port = 8000

        # CORS - allow either a JSON array or comma-separated string
        self.cors_origins: List[str] = _parse_list_env(
            os.getenv("CORS_ORIGINS"), [
                "http://localhost:5173",
                "https://d9783a22362a.ngrok-free.app",
                "https://05sf7791-5173.euw.devtunnels.ms",
                "https://05sf7791-8000.euw.devtunnels.ms",
            ]
        )

        # Upload Configuration
        try:
            self.max_upload_size_mb: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "50"))
        except ValueError:
            self.max_upload_size_mb = 50

        self.allowed_extensions: List[str] = _parse_list_env(
            os.getenv("ALLOWED_EXTENSIONS"), ["pdf", "docx", "txt", "png", "jpg", "jpeg"]
        )

        self.upload_dir: str = os.getenv("UPLOAD_DIR", "uploads")


settings = Settings()
