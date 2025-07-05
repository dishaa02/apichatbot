from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import requests
import random
import io
from fastapi.staticfiles import StaticFiles
import os

# For file processing
from typing import List
from PIL import Image
import pytesseract
import PyPDF2
import docx

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://localhost:8080",         # <--- ADD THIS LINE
        "http://127.0.0.1:8080"          # <--- (optional, for 127.0.0.1:8080)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Multiple OpenRouter API Keys
API_KEYS = [
    "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"
]

BASE_URL = "https://openrouter.ai/api/v1/chat/completions"

# ✅ Input schema
class PromptInput(BaseModel):
    prompt: str
    model: str

class ChainRequest(BaseModel):
    prompt: str
    models: list[str]

# ✅ Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "Backend is running"}

# ✅ Main endpoint to send prompt and receive model response
@app.post("/ask")
def ask_model(data: PromptInput):
    last_error = None

    # Shuffle keys to distribute load (optional)
    keys = API_KEYS.copy()
    random.shuffle(keys)

    for api_key in keys:
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        print(f"Trying API key: {api_key[:10]}...{api_key[-4:]}")
        print(f"Headers: {headers}")
        payload = {
            "model": data.model,
            "messages": [
                {"role": "user", "content": data.prompt}
            ]
        }
        response = requests.post(BASE_URL, headers=headers, json=payload)
        print(f"Status code: {response.status_code}, Response: {response.text}")

        if response.status_code == 200:
            try:
                result = response.json()
                return {
                    "model": data.model,
                    "response": result["choices"][0]["message"]["content"]
                }
            except Exception as e:
                raise HTTPException(status_code=500, detail="Invalid response format: " + str(e))

        # Rotate on 429 or 403
        elif response.status_code in (429, 403):
            last_error = f"❌ API key ending in ...{api_key[-8:]} failed: {response.status_code}"
            continue
        else:
            raise HTTPException(status_code=response.status_code, detail=response.text)

    # All keys failed
    raise HTTPException(status_code=429, detail=f"All keys exhausted. Last error: {last_error or 'Unknown error'}")

@app.post("/chain")
def chain_models(data: ChainRequest):
    last_error = None
    current_prompt = data.prompt
    responses = []

    for model_id in data.models:
        keys = API_KEYS.copy()
        random.shuffle(keys)
        for api_key in keys:
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": model_id,
                "messages": [
                    {"role": "user", "content": current_prompt}
                ]
            }
            response = requests.post(BASE_URL, headers=headers, json=payload)
            if response.status_code == 200:
                try:
                    result = response.json()
                    content = result["choices"][0]["message"]["content"]
                    responses.append({"model": model_id, "response": content})
                    current_prompt = content  # Pass output to next model
                    break
                except Exception as e:
                    raise HTTPException(status_code=500, detail="Invalid response format: " + str(e))
            elif response.status_code in (429, 403, 401):
                last_error = f"API key ending in ...{api_key[-8:]} failed: {response.status_code}"
                continue
            else:
                raise HTTPException(status_code=response.status_code, detail=response.text)
        else:
            responses.append({"model": model_id, "response": f"Error: All keys exhausted for {model_id}. Last error: {last_error or 'Unknown error'}"})
            current_prompt = data.prompt

    return {"responses": responses}

@app.post("/upload")
def upload_files(files: List[UploadFile] = File(...)):
    extracted_texts = []
    for file in files:
        filename = file.filename.lower()
        content = file.file.read()
        text = ""
        try:
            if filename.endswith('.pdf'):
                reader = PyPDF2.PdfReader(io.BytesIO(content))
                for page in reader.pages:
                    text += page.extract_text() or ""
            elif filename.endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff')):
                image = Image.open(io.BytesIO(content))
                text = pytesseract.image_to_string(image)
            elif filename.endswith(('.doc', '.docx')):
                doc = docx.Document(io.BytesIO(content))
                text = "\n".join([para.text for para in doc.paragraphs])
            else:
                text = content.decode(errors='ignore')
        except Exception as e:
            text = f"[Error processing {filename}: {str(e)}]"
        extracted_texts.append({"filename": file.filename, "text": text})
    return {"files": extracted_texts}

# Serve React build files (dist) as static files
frontend_dist = os.path.join(os.path.dirname(__file__), "../dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 