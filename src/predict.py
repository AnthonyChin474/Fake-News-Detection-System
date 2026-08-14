import joblib
import re
import math

# ==========================
# LOAD MODEL AND VECTORIZER
# ==========================

model = joblib.load("models/svm_model.pkl")
vectorizer = joblib.load("models/vectorizer.pkl")


# ==========================
# CLEAN TEXT FUNCTION
# ==========================

def clean_text(text):

    text = text.lower()

    # Remove URLs
    text = re.sub(r"http\S+", "", text)

    # Remove mentions and hashtags
    text = re.sub(r"@\w+", "", text)
    text = re.sub(r"#\w+", "", text)

    # Remove punctuation and numbers
    text = re.sub(r"[^a-zA-Z\s]", "", text)

    # Remove extra spaces
    text = re.sub(r"\s+", " ", text).strip()

    return text


# ==========================
# USER INPUT
# ==========================

user_input = input("Enter news text: ")

# Clean text
cleaned_input = clean_text(user_input)

# Transform using TF-IDF
vector_input = vectorizer.transform([cleaned_input])

# Predict
prediction = model.predict(vector_input)

# Raw SVM score
score = model.decision_function(vector_input)[0]

# Convert using sigmoid
confidence = 1 / (1 + math.exp(-score))

# Display confidence correctly
if prediction[0] == 1:
    confidence_percentage = confidence * 100

    print("\nPrediction: FAKE NEWS")
    print(f"Confidence: {confidence_percentage:.2f}%")

else:
    confidence_percentage = (1 - confidence) * 100

    print("\nPrediction: REAL NEWS")
    print(f"Confidence: {confidence_percentage:.2f}%")

