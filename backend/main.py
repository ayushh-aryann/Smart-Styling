from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Smart Styling API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
DATA_PATH = Path(__file__).resolve().parents[1] / "dataset" / "Female_Fashion_Dataset.xlsx"

if not DATA_PATH.exists():
    df = None
else:
    df = pd.read_excel(DATA_PATH).fillna("")


@app.get("/")
def home():
    return {"message": "Backend is working"}

@app.get("/categories")
def get_categories():
    if df is None:
        raise HTTPException(status_code=500, detail="Dataset not found")
    return {"categories": sorted(df["Category"].unique().tolist())}

@app.get("/types")
def get_types(category: str):
    if df is None:
        raise HTTPException(status_code=500, detail="Dataset not found")

    sub = df[df["Category"].str.lower() == category.lower()]
    if sub.empty:
        raise HTTPException(status_code=404, detail="Category not found")

    return {"types": sorted(sub["Type"].unique().tolist())}

class RecommendRequest(BaseModel):
    category: str
    type: str

@app.post("/recommend")
def recommend(req: RecommendRequest):
    if df is None:
        raise HTTPException(status_code=500, detail="Dataset not found")

    sub = df[
        (df["Category"].str.lower() == req.category.lower()) &
        (df["Type"].str.lower() == req.type.lower())
    ]

    if sub.empty:
        raise HTTPException(status_code=404, detail="No match found")

    row = sub.iloc[0]

    return {
        "category": row["Category"],
        "type": row["Type"],
        "best_styles": row["Best Styles / Recommended"],
        "avoid_styles": row["Avoid Styles"]
    }
