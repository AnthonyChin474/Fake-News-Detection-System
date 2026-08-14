import joblib

vectorizer = joblib.load("models/vectorizer.pkl")
model = joblib.load("models/best_model.pkl")

tests = [
    "Donald Trump wins election despite media criticism",
    "COVID vaccine causes magnetic arms and mind control",
    "Reuters reports Malaysia economy grew 4.5 percent this quarter",
    "Scientists discover aliens living inside bananas"
]

for t in tests:
    vec = vectorizer.transform([t])

    pred = model.predict(vec)[0]

    score = model.decision_function(vec)[0]

    print("\nTEXT:", t)
    print("Prediction:", pred)
    print("Score:", score)