# TruthGuard — Misinformation Detection Web Application

**COS30049 Group 10**

| Name | Student ID |
|------|-----------|
| Anthony Chin Zheng Yong | 106215389 |
| Jeremy P'ng How Jian | 106215648 |
| Lee Kai Venn | 106197403 |

---

## 1. System Requirements

Before running the application, ensure the following software is installed:

* Python 3.11 or later
* Node.js 18 or later
* npm
* Visual Studio Code (Recommended)

---

# 2. Project Structure

```
Assignment 3 Computing final final/
├── backend/
│   ├── main.py                  # FastAPI server — all API endpoints
│   └── frontend-react/          # (ignore — use root frontend-react instead)
├── frontend-react/
│   ├── src/
│   │   ├── App.jsx              # Main React application
│   │   ├── App.css              # Global styles
│   │   └── main.jsx             # React entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── models/
│   ├── best_model.pkl           # Trained Linear SVM model
│   └── vectorizer.pkl           # Fitted TF-IDF vectorizer
├── datasets/
│   ├── raw/                     # Original datasets
│   ├── processed/               # Cleaned and combined datasets
│   └── Test File/               # Sample CSV files for testing
├── src/
│   ├── train_model.py           # Model training script
│   ├── data_preprocessing.py    # Data cleaning script
│   ├── combine_datasets.py      # Dataset combination script
│   ├── predict.py               # Standalone CLI prediction script
│   └── download_dataset.py      # Dataset download helper
└── README.md                    # This file
```

---

# 3. Backend Setup

## Step 1

Open a terminal and navigate to the backend folder.

```bash
cd backend
```

## Step 2

Install the required Python libraries.

```bash
pip install -r requirements.txt
```

If **requirements.txt** is unavailable, install the libraries manually.

```bash
pip install fastapi
pip install uvicorn
pip install pandas
pip install numpy
pip install scikit-learn
pip install scipy
pip install joblib
pip install python-multipart
pip install pydantic
pip install nltk
pip install imbalanced-learn
pip install openpyxl
pip install matplotlib
pip install python-dotenv
pip install aiofiles
```

## Step 3

Start the FastAPI backend.

```bash
uvicorn main:app --reload
```

If the backend starts successfully, the terminal will display:

```text
Uvicorn running on http://127.0.0.1:8000
```

The FastAPI API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

---

# 4. Frontend Setup

Open another terminal.

Navigate to the frontend folder.

```bash
cd frontend-react
```

Install the required Node.js packages.

```bash
npm install
```

If any packages are missing, install them manually.

```bash
npm install react
npm install react-dom
npm install react-router-dom
npm install axios
npm install chart.js
npm install react-chartjs-2
npm install vite
```

Start the React application.

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

---

# 5. AI Model Configuration

The AI model used in this application was developed in Assignment 2.

Ensure the following files are located inside the backend **models** folder.

```text
backend/models/

svm_model.pkl
vectorizer.pkl
```

These files are automatically loaded by the FastAPI backend during server startup.

No model retraining is required before running the application.

---

# 6. Running the Application

1. Start the FastAPI backend.

```bash
cd backend
uvicorn main:app --reload
```

2. Open another terminal and start the React frontend.

```bash
cd frontend-react
npm install
npm run dev
```

3. Open your web browser and visit:

```text
http://localhost:5173
```

4. Enter a news article or upload a CSV file.

5. Click **Analyze** to obtain the prediction result.

---

# 7. Troubleshooting

### Backend cannot start

Reinstall all required Python libraries.

```bash
pip install -r requirements.txt
```

---

### Frontend cannot start

Reinstall the frontend dependencies.

```bash
npm install
```

---

### API connection failed

Ensure the backend server is running before starting the frontend.

Backend URL:

```text
http://127.0.0.1:8000
```

---

### Model loading error

Ensure the following files exist:

```text
backend/models/

svm_model.pkl
vectorizer.pkl
```

---

### Missing Python packages

Install the missing package using:

```bash
pip install package-name
```

For example:

```bash
pip install scikit-learn
```
