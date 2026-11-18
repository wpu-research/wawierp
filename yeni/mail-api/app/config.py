"""Ayarlar: tum degerler ortam degiskenlerinden okunur."""
import os
from pathlib import Path


def env(name: str, default: str = "") -> str:
    return os.environ.get(name, default)


def data_dir() -> Path:
    p = Path(env("DATA_DIR", str(Path(__file__).resolve().parent.parent / "data")))
    p.mkdir(parents=True, exist_ok=True)
    return p
