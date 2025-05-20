from flask import Flask, jsonify, request
from werkzeug.utils import secure_filename
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from flask_cors import CORS
import fitz
import re
import os
import traceback


app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = 'uploads'

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

try:
    model = SentenceTransformer('all-MiniLM-L6-v2')
    print("✅ Model loaded successfully.")
except Exception as e:
    print("❌ Failed to load model:", str(e))
    model = None


# --- Helper functions ---

def extract_text(pdf_path):
    # Extract text from a PDF file using PyMuPDF 
    try:
        doc = fitz.open(pdf_path)
        text = ''.join([page.get_text() for page in doc])
        return text
    except Exception as e:
        raise Exception(f"Failed to extract text from {pdf_path}: {e}")
    
def clean_text(text):
    # Clean the text by removing special characters and extra spaces
    text = re.sub(r'\s+', ' ', text) 
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)  
    return text.lower()

# --- Routes --- 
@app.route('/upload', methods=['POST'])
def home():
    return "Resume screening API is running"

@app.route('/api/screen', methods=['POST'])
def screen_resume():
    try:
        print("FORM keys:", request.form.keys())
        print("FILE keys:", request.files.keys())
        if model is None:
            return jsonify({"error": "Model not loaded"}), 500

        if 'job_desc' in request.form:
            job_desc_text = request.form['job_desc']
        elif 'job_desc_file' in request.files:
            file = request.files['job_desc_file']
            job_desc_text = file.read().decode('utf-8') 
        else:
            return jsonify({"error": "Missing job description"}), 400
            
        if 'resumes' not in request.files:
            return jsonify({"error": "Missing resumes"}), 400
        

        cleaned_job = clean_text(job_desc_text);
        job_embedding = model.encode(cleaned_job)

        results = []
        for file in request.files.getlist('resumes'):
            if file.filename == '':
                continue

            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)

            try:
                resume_text = extract_text(file_path)
                cleaned_resume = clean_text(resume_text)
                resume_embedding = model.encode(cleaned_resume)
                similarity = cosine_similarity([job_embedding], [resume_embedding])[0][0]

                results.append({
                    "fileName": filename,  
                    "score": float(round(similarity * 100, 2)), 
                    "skills": [],
                    "experience": "",
                    "education": "",
                    "location": "",
                    "lastPosition": ""
                }) 

            except Exception as e:
                results.append({ 
                    "fileName": filename,
                    "error": f"Failed to process file: {str(e)}"
                })


            finally:
                if os.path.exists(file_path):
                        os.remove(file_path)

        results.sort(key=lambda x: x.get('score', 0), reverse=True)

        return jsonify({
            "scores": results,
        })
    
    except Exception as e:
        traceback.print_exc()   # full stack trace to console
        return jsonify({"error": str(e)}), 500
    

if __name__ == '__main__':
    app.run(debug=True)     