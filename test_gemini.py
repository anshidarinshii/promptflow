import os
from pathlib import Path
import google.generativeai as genai
import base64

BASE_DIR = Path(__file__).resolve().parent
env_file = BASE_DIR / "backend" / ".env"
if env_file.exists():
    with open(env_file, "r") as f:
        for line in f:
            if line.strip() and not line.startswith('#'):
                key, value = line.strip().split('=', 1)
                os.environ[key] = value

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
print("Key exists:", bool(GEMINI_API_KEY))
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    
model = genai.GenerativeModel('gemini-1.5-pro')
try:
    contents = ["Tell me a joke"]
    response = model.generate_content(contents)
    print("Response text:", response.text)
except Exception as e:
    import traceback
    traceback.print_exc()
