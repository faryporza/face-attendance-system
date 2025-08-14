import os
import face_recognition
import numpy as np

INPUT_DIR = 'known_faces'
OUTPUT_DIR = 'encodings'

for filename in os.listdir(INPUT_DIR):
    if filename.endswith('.jpg') or filename.endswith('.png'):
        path = os.path.join(INPUT_DIR, filename)
        image = face_recognition.load_image_file(path)
        encodings = face_recognition.face_encodings(image)

        if encodings:
            name = os.path.splitext(filename)[0]
            np.save(os.path.join(OUTPUT_DIR, f"{name}.npy"), encodings[0])
            print(f"[✓] Encoded {filename}")
        else:
            print(f"[x] No face found in {filename}")
