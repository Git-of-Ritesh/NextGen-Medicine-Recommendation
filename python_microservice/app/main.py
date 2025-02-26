from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.predict import get_prediction
import uvicorn

app = FastAPI()

class UserInput(BaseModel):
    symptom: str
    healthFactor: str
    ageGroup: str
    severity: str
    userPreference: str

@app.post("/predict")
def predict_endpoint(data: UserInput):
    try:
        result = get_prediction(data.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
