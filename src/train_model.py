import pandas as pd
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split

from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.ensemble import RandomForestClassifier

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report
)

# ==========================================
# LOAD CLEANED DATASET
# ==========================================

print("Loading combined dataset...")

df = pd.read_csv("datasets/processed/combined_dataset.csv")

print("\nDataset Preview:")
print(df.head())

# ==========================================
# DATA CLEANING AND VALIDATION
# ==========================================

# Remove rows with missing cleaned_text
df = df.dropna(subset=['cleaned_text'])

# Convert text column to string
df['cleaned_text'] = df['cleaned_text'].astype(str)

# Remove empty text rows
df = df[df['cleaned_text'].str.strip() != ""]

# Features and labels
X = df['cleaned_text']
y = df['label']

print("\nDataset Shape:")
print(df.shape)

# ==========================================
# TF-IDF FEATURE EXTRACTION
# ==========================================

print("\nApplying TF-IDF vectorization...")

vectorizer = TfidfVectorizer(
    max_features=5000,
    stop_words='english'
)

X = vectorizer.fit_transform(X)

# ==========================================
# TRAIN TEST SPLIT
# ==========================================

print("\nSplitting dataset into training and testing sets...")

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# ==========================================
# MACHINE LEARNING MODELS
# ==========================================

models = {
    "Logistic Regression": LogisticRegression(),
    
    "Linear SVM": LinearSVC(),
    
    "Random Forest": RandomForestClassifier(
        n_estimators=100,
        max_depth=20,
        random_state=42,
        n_jobs=-1
    )
}

# ==========================================
# STORE BEST MODEL RESULTS
# ==========================================

best_model = None
best_model_name = ""
best_f1_score = 0

results = []

# ==========================================
# TRAIN AND EVALUATE MODELS
# ==========================================

for name, model in models.items():

    print("\n==============================")
    print(f"Training {name}...")
    print("==============================")

    # Train model
    model.fit(X_train, y_train)

    # Generate predictions
    predictions = model.predict(X_test)

    # Calculate evaluation metrics
    accuracy = accuracy_score(y_test, predictions)
    precision = precision_score(y_test, predictions)
    recall = recall_score(y_test, predictions)
    f1 = f1_score(y_test, predictions)

    # Store results
    results.append({
        "Model": name,
        "Accuracy": accuracy,
        "Precision": precision,
        "Recall": recall,
        "F1 Score": f1
    })

    # Print evaluation metrics
    print(f"Accuracy : {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall   : {recall:.4f}")
    print(f"F1 Score : {f1:.4f}")

    # Print classification report
    print("\nClassification Report:")
    print(classification_report(y_test, predictions))

    # ==========================================
    # SAVE BEST MODEL BASED ON F1-SCORE
    # ==========================================

    if f1 > best_f1_score:
        best_f1_score = f1
        best_model = model
        best_model_name = name

# ==========================================
# SAVE BEST MODEL AND VECTORIZER
# ==========================================

joblib.dump(best_model, "models/best_model.pkl")
joblib.dump(vectorizer, "models/vectorizer.pkl")

# ==========================================
# DISPLAY FINAL RESULTS
# ==========================================

print("\n====================================")
print("MODEL COMPARISON RESULTS")
print("====================================")

results_df = pd.DataFrame(results)

print(results_df)

print("\n====================================")
print(f"Best Model: {best_model_name}")
print(f"Best F1-Score: {best_f1_score:.4f}")
print("====================================")

print("\nBest model saved successfully!")

