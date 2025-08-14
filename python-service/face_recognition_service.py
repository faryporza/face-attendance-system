from flask import Flask, request, jsonify
from flask_cors import CORS
import face_recognition
import numpy as np
import cv2
import base64
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

@app.route('/recognize', methods=['POST'])
def recognize():
    if 'image' not in request.files:
        return jsonify({'error': 'No image part'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    image = face_recognition.load_image_file(file)
    encodings = face_recognition.face_encodings(image)

    if len(encodings) == 0:
        return jsonify({'error': 'No face found'}), 400

    # จำลอง: ส่ง encoding กลับไป
    return jsonify({'encoding': encodings[0].tolist()})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
