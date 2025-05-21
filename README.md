ResuMatch

A resume screening web application that allows recruiters to upload job descriptions and candidate resumes (PDFs) and receive a ranked list of candidates with extracted fields (skills, experience, education, location, and last position) along with a match score.

🔍 Features

PDF Resume Parsing using PyMuPDF (fitz).

Text Extraction and Field Extraction (skills, experience, education, location, last position) via custom regex and spaCy NLP.

Resume–Job Matching using sentence embeddings (SentenceTransformer all-MiniLM-L6-v2) and cosine similarity.

RESTful API built with Flask and CORS support.

Frontend Integration (assumes React or similar) for uploading files and displaying results.

📦 Project Structure

backend/            # Flask API server
├── app.py          # Main application
├── uploads/        # Temporary upload folder
├── requirements.txt# Python dependencies
frontend/           # (Your React/Vue/Angular) client app
├── src/            # Components & pages
├── public/         # Static assets
├── package.json    # Frontend dependencies
README.md           # Project overview and setup

🚀 Getting Started

Prerequisites

Python 3.8+

Next js (for frontend)

pip and npm installed

Backend Setup

Clone the repo

git clone https://github.com/
cd resumatch/backend

Create and activate a virtual environment

python -m venv myenv
source myenv/bin/activate   # Linux/macOS
myenv\Scripts\activate    # Windows

Install Python dependencies

pip install -r requirements.txt

Run the Flask server

python app.py

By default, the server runs at http://127.0.0.1:5000/.

Frontend Setup

Navigate to frontend

cd ../frontend

Install Node modules

npm install

npm run dev

The frontend runs at http://localhost:3000/.

🛠️ Usage

Upload a Job Description (text or file) and one or more PDF resumes.

API Endpoint:

POST /api/screen

Form fields:

job_desc (string) or job_desc_file (file)

resumes (one or more PDF files)

Response:

{
  "scores": [
    {
      "fileName": "john_doe.pdf",
      "score": 92.48,
      "skills": ["JavaScript","React","Node.js"],
      "experience": "3 years 2 months",
      "education": "Bachelor of Computer Science, University ...",
      "lastPosition": "Frontend Developer"
    },
    ...
  ]
}

Frontend displays the ranked list with extracted fields.

⚙️ Dependencies

Backend (requirements.txt)

Flask
flask-cors
sentence-transformers
scikit-learn
pymupdf


Frontend (package.json)

{
  "dependencies": {
    "react": "^17.0.2",
    "axios": "^0.21.1",
    ...
  }
}

🧪 Testing

Postman or curl to test /api/screen with sample resumes and job descriptions.
