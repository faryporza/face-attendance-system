from flask import Flask, request, jsonify
from flask_cors import CORS
import face_recognition
import numpy as np
import cv2
import base64
from PIL import Image
import io
import os
import mysql.connector

app = Flask(__name__)
CORS(app)

# Load known encodings: prefer DB when USE_DB_ENCODINGS=1, else try encodings.npz
def load_known_encodings():
    use_db = os.getenv('USE_DB_ENCODINGS', '0') == '1'
    known_encodings = []
    known_names = []

    if use_db:
        try:
            db_host = os.getenv('DB_HOST', 'localhost')
            db_user = os.getenv('DB_USER', 'root')
            db_pass = os.getenv('DB_PASSWORD', '')
            db_name = os.getenv('DB_NAME', '')
            conn = mysql.connector.connect(
                host=db_host,
                user=db_user,
                password=db_pass,
                database=db_name
            )
            cursor = conn.cursor()
            # NOTE: query users table (not employees). face_encoding expected as comma-separated floats.
            cursor.execute("SELECT name, face_encoding FROM users WHERE face_encoding IS NOT NULL")
            rows = cursor.fetchall()
            cursor.close()
            conn.close()

            for name, encoding_str in rows:
                try:
                    encoding_list = [float(x) for x in encoding_str.split(",") if x.strip() != ""]
                    known_encodings.append(np.array(encoding_list))
                    known_names.append(name)
                except Exception as e:
                    print(f"⚠️ Error parsing encoding for {name}: {e}")

            print(f"🔁 Loaded {len(known_encodings)} known encodings from DB (users table)")
        except Exception as e:
            print("⚠️ Failed to load encodings from DB:", e)
            known_encodings, known_names = [], []

    # Fallback to encodings.npz if DB not used or empty
    enc_file = os.path.join(os.path.dirname(__file__), 'encodings.npz')
    if not known_encodings and os.path.exists(enc_file):
        try:
            data = np.load(enc_file, allow_pickle=True)
            file_encs = data.get('encodings', [])
            file_names = data.get('names', [])
            known_encodings = list(file_encs)
            known_names = list(file_names)
            print(f"🔁 Loaded {len(known_encodings)} known encodings from encodings.npz")
        except Exception as e:
            print("⚠️ Failed to load encodings.npz:", e)

    return known_encodings, known_names

def read_image_from_request():
    # Prefer multipart/form-data file 'image'
    if 'image' in request.files:
        file = request.files['image']
        img = face_recognition.load_image_file(file)
        return img
    # Support JSON with base64 'image' field
    if request.is_json:
        body = request.get_json()
        b64 = body.get('image') if body else None
        if b64:
            try:
                image_bytes = base64.b64decode(b64)
                img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
                return np.array(img)
            except Exception as e:
                print("⚠️ Error decoding base64 image:", e)
                return None
    return None

@app.route('/recognize', methods=['POST'])
def recognize():
    img = read_image_from_request()
    if img is None:
        print("❌ No image provided in request")
        return jsonify({'success': False, 'reason': 'no_image'}), 200

    encodings = face_recognition.face_encodings(img)
    if not encodings:
        print("❌ No face detected in the provided image")
        return jsonify({'success': False, 'reason': 'no_face'}), 200

    query_encoding = encodings[0]
    known_encodings, known_names = load_known_encodings()

    if not known_encodings:
        print("⚠️ No known face encodings configured (known_encodings is empty)")
        # Return the encoding length to help debugging
        return jsonify({
            'success': False,
            'reason': 'no_known_faces',
            'encoding_length': len(query_encoding)
        }), 200

    # Compute distances and matches
    distances = face_recognition.face_distance(known_encodings, query_encoding)
    min_distance = float(np.min(distances))
    min_idx = int(np.argmin(distances))
    tolerance = float(os.getenv('FACE_MATCH_TOLERANCE', 0.6))
    matches = face_recognition.compare_faces(known_encodings, query_encoding, tolerance=tolerance)

    print("🔍 Face distances:", distances.tolist() if hasattr(distances, 'tolist') else list(distances))
    print("✅ Matches:", matches)
    print(f"ℹ️ Min distance: {min_distance:.4f} (index {min_idx}), tolerance={tolerance}")

    if any(matches):
        matched_idx = matches.index(True)
        name = known_names[matched_idx] if matched_idx < len(known_names) else f"user_{matched_idx}"
        print(f"🎯 Face matched: {name} (distance={float(distances[matched_idx]):.4f})")
        return jsonify({
            'success': True,
            'person_name': name,
            'confidence': float(1.0 - distances[matched_idx]),  # approximate confidence
            'distance': float(distances[matched_idx])
        }), 200

    print("❌ No match above tolerance")
    return jsonify({
        'success': False,
        'reason': 'low_confidence',
        'min_distance': min_distance
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PYTHON_SERVICE_PORT', 5001)))
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PYTHON_SERVICE_PORT', 5001)))
