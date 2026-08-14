from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from collections import Counter
import joblib
import os
import math
import re
import pandas as pd
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS

app = FastAPI()

# Allow frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and vectorizer
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

model = joblib.load(
    os.path.join(BASE_DIR, "models", "best_model.pkl")
)

vectorizer = joblib.load(
    os.path.join(BASE_DIR, "models", "vectorizer.pkl")
)

class NewsInput(BaseModel):
    text: str

@app.get("/")
def home():
    return {
        "message": "TruthGuard API Running"
    }

@app.post("/predict")
def predict(news: NewsInput):

    vector = vectorizer.transform([news.text])

    prediction = model.predict(vector)[0]

    score = model.decision_function(vector)[0]

    confidence = 1 / (1 + math.exp(-score))

    if prediction == 1:
        result = "FAKE NEWS"
        confidence = confidence * 100
    else:
        result = "REAL NEWS"
        confidence = (1 - confidence) * 100

    return {
        "prediction": result,
        "confidence": round(confidence, 2)
    }

@app.post("/predict-csv")
async def predict_csv(file: UploadFile = File(...), column_name: str = Form("cleaned_text")):

    df = pd.read_csv(file.file)

    if column_name not in df.columns:
        return {
            "error": f"Column '{column_name}' not found. Available columns: {', '.join(df.columns.tolist())}"
        }

    predictions = []
    confidences = []

    for text in df[column_name]:

        vector = vectorizer.transform([str(text)])

        prediction = model.predict(vector)[0]

        score = model.decision_function(vector)[0]

        confidence = 1 / (1 + math.exp(-score))

        if prediction == 1:
            predictions.append("FAKE NEWS")
            confidences.append(round(confidence * 100, 2))
        else:
            predictions.append("REAL NEWS")
            confidences.append(round((1 - confidence) * 100, 2))

    df["prediction"] = predictions
    df["confidence"] = confidences

    # Replace NaN with empty string so JSON serialization does not crash
    df = df.fillna("")

    # Top keywords driving FAKE vs REAL predictions (by TF-IDF weight in model coefficients)
    feature_names = vectorizer.get_feature_names_out()
    coefs = model.coef_[0] if hasattr(model, "coef_") else None

    top_fake_words = []
    top_real_words = []
    if coefs is not None:
        top_fake_idx = coefs.argsort()[-10:][::-1]
        top_real_idx = coefs.argsort()[:10]
        top_fake_words = [feature_names[i] for i in top_fake_idx]
        top_real_words = [feature_names[i] for i in top_real_idx]

    return {
        "rows": df.to_dict(orient="records"),
        "top_fake_words": top_fake_words,
        "top_real_words": top_real_words,
    }

@app.post("/evaluate-csv")
async def evaluate_csv(
    file: UploadFile = File(...),
    column_name: str = Form("cleaned_text"),
    label_column: str = Form(...),
    positive_label: str = Form("FAKE"),
):
    """
    Evaluates the existing trained model against a user-provided labeled
    dataset. Does NOT retrain the model — this only scores how well the
    current model performs as a held-out test set.
    """
    from sklearn.metrics import (
        accuracy_score,
        precision_score,
        recall_score,
        f1_score,
        confusion_matrix,
    )

    df = pd.read_csv(file.file)

    if column_name not in df.columns:
        return {
            "error": f"Text column '{column_name}' not found. Available columns: {', '.join(df.columns.tolist())}"
        }

    if label_column not in df.columns:
        return {
            "error": f"Label column '{label_column}' not found. Available columns: {', '.join(df.columns.tolist())}"
        }

    df = df.dropna(subset=[column_name, label_column])
    df[column_name] = df[column_name].astype(str)

    # Normalize labels to 0 (real) / 1 (fake), accepting common label spellings
    raw_labels = df[label_column].astype(str).str.strip().str.upper()

    fake_aliases = {"FAKE", "FAKE NEWS", "1", "FALSE", "PANTS-FIRE", str(positive_label).upper()}
    real_aliases = {"REAL", "REAL NEWS", "0", "TRUE"}

    def normalize_label(val):
        if val in fake_aliases:
            return 1
        if val in real_aliases:
            return 0
        return None

    df["_y_true"] = raw_labels.apply(normalize_label)
    unmatched = df["_y_true"].isna().sum()
    df = df.dropna(subset=["_y_true"])
    df["_y_true"] = df["_y_true"].astype(int)

    if len(df) == 0:
        return {
            "error": "No rows had a recognizable label. Expected values like REAL/FAKE, TRUE/FALSE, or 0/1."
        }

    vectors = vectorizer.transform(df[column_name])
    y_pred = model.predict(vectors)
    y_true = df["_y_true"].values

    accuracy = accuracy_score(y_true, y_pred)
    precision = precision_score(y_true, y_pred, zero_division=0)
    recall = recall_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)

    cm = confusion_matrix(y_true, y_pred, labels=[0, 1])
    tn, fp, fn, tp = cm.ravel()

    return {
        "rows_evaluated": int(len(df)),
        "rows_skipped_unmatched_label": int(unmatched),
        "accuracy": round(float(accuracy) * 100, 2),
        "precision": round(float(precision) * 100, 2),
        "recall": round(float(recall) * 100, 2),
        "f1_score": round(float(f1) * 100, 2),
        "confusion_matrix": {
            "true_negative": int(tn),   # correctly predicted REAL
            "false_positive": int(fp),  # predicted FAKE, actually REAL
            "false_negative": int(fn),  # predicted REAL, actually FAKE
            "true_positive": int(tp),   # correctly predicted FAKE
        },
    }

@app.get("/stats")
def get_stats():
    dataset_path = os.path.join(
        BASE_DIR,
        "datasets",
        "processed",
        "combined_dataset.csv"
    )

    df = pd.read_csv(dataset_path, usecols=["cleaned_text", "label"])
    df["label"] = pd.to_numeric(df["label"], errors="coerce")
    df = df[df["label"].isin([0, 1])].copy()
    df["cleaned_text"] = df["cleaned_text"].fillna("").astype(str)
    df["text_length"] = df["cleaned_text"].str.split().str.len()

    real_rows = df[df["label"] == 0]
    fake_rows = df[df["label"] == 1]

    fake_word_counts = Counter()
    for text in fake_rows["cleaned_text"]:
        words = re.findall(r"\b[a-zA-Z][a-zA-Z']*\b", text.lower())
        fake_word_counts.update(
            word for word in words
            if word not in ENGLISH_STOP_WORDS and len(word) > 1
        )

    return {
        "total_records": int(len(df)),
        "real_news": int(len(real_rows)),
        "fake_news": int(len(fake_rows)),
        "real_average_length": round(float(real_rows["text_length"].mean()), 2)
        if not real_rows.empty else 0,
        "fake_average_length": round(float(fake_rows["text_length"].mean()), 2)
        if not fake_rows.empty else 0,
        "top_keywords": [
            [word, int(count)]
            for word, count in fake_word_counts.most_common(10)
        ],
    }
