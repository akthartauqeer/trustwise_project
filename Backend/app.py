from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForSequenceClassification, RobertaTokenizer, RobertaForSequenceClassification
import firebase_admin
from firebase_admin import credentials, auth, firestore
from datetime import datetime

app = Flask(__name__)
CORS(app)

cred = credentials.Certificate("firebase-service-account-key.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

try:
    tokenizer_edu = AutoTokenizer.from_pretrained("HuggingFaceTB/fineweb-edu-classifier")
    model_edu = AutoModelForSequenceClassification.from_pretrained("HuggingFaceTB/fineweb-edu-classifier")
except Exception as e:
    print(f"Error loading education model: {e}")
    tokenizer_edu, model_edu = None, None

try:
    tokenizer_tox = RobertaTokenizer.from_pretrained('s-nlp/roberta_toxicity_classifier')
    model_tox = RobertaForSequenceClassification.from_pretrained('s-nlp/roberta_toxicity_classifier')
except Exception as e:
    print(f"Error loading toxicity model: {e}")
    tokenizer_tox, model_tox = None, None

@app.route('/analyze', methods=['POST'])
def analyze_text():
    try:
        if not request.is_json:
            return jsonify({"error": "Invalid JSON format"}), 400

        data = request.get_json()

        # Extract JWT Token
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header[7:]

        if token is None:
            return jsonify({"error": "Missing or invalid JWT token"}), 400

        try:
            decoded_token = auth.verify_id_token(token)
            uid = decoded_token['uid']
        except Exception as e:
            return jsonify({"error": "Invalid or expired JWT token"}), 401

        if 'text' not in data or not isinstance(data['text'], str) or data['text'].strip() == "":
            return jsonify({"error": "Missing or invalid 'text' field"}), 400

        text = data['text']

        if not tokenizer_tox or not model_tox or not tokenizer_edu or not model_edu:
            return jsonify({"error": "Models failed to load"}), 500

        try:
            inputs = tokenizer_tox(text, return_tensors="pt", truncation=True, padding=True)
            with torch.no_grad():
                logits = model_tox(**inputs).logits

            probs = F.softmax(logits, dim=-1)
            toxicity_score = probs[0][1].item()
        except Exception as e:
            toxicity_score = 0.0

        try:
            inputs = tokenizer_edu(text, return_tensors="pt", truncation=True, padding="longest")
            with torch.no_grad():
                logits = model_edu(**inputs).logits.squeeze(-1)

            education_score = logits.item()
            education_score = max(0, (education_score - 0) / (5 - 0))
        except Exception as e:
            education_score = -1

        timestamp = datetime.utcnow().isoformat()  
        try:
            doc_ref = db.collection("users").document(uid).collection("requests")
            doc_ref.document(timestamp).set({
                "text": text,
                "toxicity_score": toxicity_score,
                "education_score": education_score,
                "timestamp": firestore.SERVER_TIMESTAMP
            })  
        except Exception as e:
            return jsonify({"error": "Failed to save data to Firestore"}), 500

        return jsonify({
            "text": text,
            "toxicity": {"score": toxicity_score},
            "education": {"score": education_score},
            "jwt_token": token,
            "user_id": uid
        })

    except Exception as e:
        return jsonify({"error": f"Unexpected server error: {str(e)}"}), 500

@app.route('/history', methods=['GET'])
def fetch_history():
    try:
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header[7:]

        if token is None:
            return jsonify({"error": "Missing or invalid JWT token"}), 400

        # Verify Firebase JWT token and get UID
        try:
            decoded_token = auth.verify_id_token(token)
            uid = decoded_token['uid']
        except Exception as e:
            return jsonify({"error": "Invalid or expired JWT token"}), 401

        # Fetch the user's history from Firestore
        user_requests_ref = db.collection("users").document(uid).collection("requests")
        requests = user_requests_ref.stream()

        history = []
        for request_doc in requests:
            history.append(request_doc.to_dict())

        return jsonify({"history": history})

    except Exception as e:
        return jsonify({"error": f"Unexpected server error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
