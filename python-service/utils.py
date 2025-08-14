import os
import numpy as np
import face_recognition

ENCODINGS_DIR = 'encodings'

def load_known_encodings():
    encodings = {}
    for filename in os.listdir(ENCODINGS_DIR):
        if filename.endswith('.npy'):
            name = os.path.splitext(filename)[0]
            path = os.path.join(ENCODINGS_DIR, filename)
            encodings[name] = np.load(path)
    return encodings

def compare_face(image):
    unknown_encodings = face_recognition.face_encodings(image)
    if not unknown_encodings:
        return {'matched': False, 'reason': 'No face detected'}

    unknown = unknown_encodings[0]
    known = load_known_encodings()

    for name, known_encoding in known.items():
        match = face_recognition.compare_faces([known_encoding], unknown)[0]
        if match:
            distance = face_recognition.face_distance([known_encoding], unknown)[0]
            return {'matched': True, 'name': name, 'confidence': float(1 - distance)}
    
    return {'matched': False, 'reason': 'No match found'}
