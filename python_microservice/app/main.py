from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.predict import predict_disease  # ✅ Matches the function in predict.py
import uvicorn
import httpx  # For sending async HTTP requests to Node.js

# Initialize FastAPI app
app = FastAPI()

# ✅ Allow requests from your frontend (adjust in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Input schema aligned with new model (v2)
class UserInput(BaseModel):
    symptoms: str           # e.g. "fever, cough"
    healthFactors: str = "" # optional, e.g. "diabetes, smoker"
    ageGroup: str           # e.g. "adult"
    severity: str           # e.g. "moderate"

# ✅ ML prediction endpoint
@app.post("/predict")
def predict_endpoint(data: UserInput):
    """
    Calls the ML model to predict disease based on user input.
    """
    try:
        result = predict_disease(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ✅ SSE proxy to Node.js streaming endpoint
NODE_SERVER_URL = "http://localhost:5000/api/recommendations/stream"

@app.get("/api/recommendations/stream")
async def stream_recommendations():
    """
    Proxies the streaming response from Node.js recommendation generator.
    """
    async def event_generator():
        try:
            async with httpx.AsyncClient(timeout=None) as client:
                async with client.stream("GET", NODE_SERVER_URL) as response:
                    async for chunk in response.aiter_text():
                        yield chunk
        except Exception as e:
            yield f"data: Error: {str(e)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

# ✅ Run app with live reload
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
