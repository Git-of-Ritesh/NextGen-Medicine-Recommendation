from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.predict import get_prediction
import uvicorn
import asyncio
import httpx  # For sending requests to Node.js

app = FastAPI()

# Allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

class UserInput(BaseModel):
    symptom: str
    healthFactor: str
    ageGroup: str
    severity: str
    userPreference: str

@app.post("/predict")
def predict_endpoint(data: UserInput):
    try:
        result = get_prediction(data.dict())  # Predict the disease
        return result  # Only return the disease, not alternative medicine
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Fix streaming response by forwarding request to Node.js
NODE_SERVER_URL = "http://localhost:5001/api/recommendations/stream"  # Change port if needed

@app.get("/api/recommendations/stream")
async def stream_recommendations():
    async def event_generator():
        try:
            async with httpx.AsyncClient(timeout=None) as client:
                async with client.stream("GET", NODE_SERVER_URL) as response:
                    async for chunk in response.aiter_text():
                        yield chunk  # Stream response from Node.js
        except Exception as e:
            yield f"data: Error: {str(e)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
