import os
from pathlib import Path
import google.generativeai as genai

BASE_DIR = Path(__file__).resolve().parent
env_file = BASE_DIR / "backend" / ".env"
if env_file.exists():
    with open(env_file, "r") as f:
        for line in f:
            if line.strip() and not line.startswith('#'):
                key, value = line.strip().split('=', 1)
                os.environ[key] = value

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

with open("models.txt", "w", encoding="utf-8") as f:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            f.write(m.name + "\n")
