from flask import Flask, jsonify, request
from werkzeug.utils import secure_filename
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from flask_cors import CORS
import fitz  # PyMuPDF
import re
import os
import traceback

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Load model
try:
    model = SentenceTransformer('all-MiniLM-L6-v2')
    print("✅ Model loaded successfully")
except Exception as e:
    print("❌ Failed to load model:", str(e))
    model = None

def extract_text(pdf_path):
    try:
        doc = fitz.open(pdf_path)
        return ' '.join([page.get_text() for page in doc])
    except Exception as e:
        raise Exception(f"PDF extraction failed: {str(e)}")

def safe_regex_search(pattern, text, flags=0):
    """Safe wrapper for regex operations"""
    try:
        return re.search(pattern, text, flags)
    except re.error:
        return None

def extract_fields(text):
    # Initialize with default values
    result = {
        "skills": [],
        "experience": "Not specified",
        "education": "Not specified",
        "location": "Not specified",
        "lastPosition": "Not specified"
    }
    
    try:
        # 1. Skills Extraction (simplified)
        skills_section = safe_regex_search(r'(?i)(?:skills|technologies)[\s:\-]*(.*?)(?=\n\w+:|$)', text, re.DOTALL)
        if skills_section:
            skills = re.findall(r'([A-Za-z]{3,}(?:\s+[A-Za-z]{3,})?)', skills_section.group(1))
            result["skills"] = list(set(skills))[:10]  # Dedupe and limit
        
        # 2. Position Extraction (simplified)
        exp_section = safe_regex_search(r'(?i)(?:experience|work\s+history)[\s:\-]*(.*?)(?=\n\w+:|$)', text, re.DOTALL)
        if exp_section:
            position = safe_regex_search(r'^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)', exp_section.group(1))
            if position:
                result["lastPosition"] = position.group(1)
        
        # 3. Education (simplified)
        education = safe_regex_search(r'(?i)(?:education|academic)[\s:\-]*(.*?)(?=\n\w+:|$)', text, re.DOTALL)
        if education:
            result["education"] = education.group(1)[:100]  # Truncate
        
        # 4. Location (simplified)
        location = safe_regex_search(r'([A-Z][a-zA-Z\s]+(?:,\s*[A-Z]{2})?)\s*\n', text)
        if location:
            result["location"] = location.group(1)
        
        # 5. Experience (years count)
        years = re.findall(r'(20\d{2}|19\d{2})', text)
        if years:
            result["experience"] = f"{len(years)} years"
    
    except Exception as e:
        print(f"Field extraction error: {str(e)}")
    
    return result

@app.route('/api/screen', methods=['POST'])
def screen_resume():
    try:
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

        job_embedding = model.encode(job_desc_text)
        results = []

        for file in request.files.getlist('resumes'):
            if file.filename == '':
                continue

            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)

            try:
                resume_text = extract_text(file_path)
                resume_embedding = model.encode(resume_text)
                similarity = cosine_similarity([job_embedding], [resume_embedding])[0][0]
                fields = extract_fields(resume_text)
                
                results.append({
                    "fileName": filename,  
                    "score": float(round(similarity * 100, 2)),
                    "skills": fields["skills"],
                    "experience": fields["experience"],
                    "education": fields["education"],
                    "location": fields["location"],
                    "lastPosition": fields["lastPosition"]
                })

            except Exception as e:
                results.append({ 
                    "fileName": filename,
                    "error": f"Failed to process file: {str(e)}"
                })
                traceback.print_exc()
            finally:
                if os.path.exists(file_path):
                    os.remove(file_path)

        results.sort(key=lambda x: x.get('score', 0), reverse=True)
        return jsonify({"scores": results})
    
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)