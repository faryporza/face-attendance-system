ได้เลยค่ะ! 🎯 นี่คือตัวอย่าง `README.md` สำหรับโฟลเดอร์ `python-service/` ซึ่งเป็น **Python Flask Face Recognition API** โดยใช้ภาพจากกล้องหรือภาพ base64 มาเปรียบเทียบใบหน้า:

---

## 🐍 Python Face Recognition API

Flask API สำหรับตรวจจับใบหน้าของพนักงาน โดยเปรียบเทียบกับภาพที่บันทึกไว้ล่วงหน้าในโฟลเดอร์ `known_faces/`

---

### 📁 โครงสร้างโฟลเดอร์

```
python-service/
│
├── known_faces/             # 📸 รูปพนักงานที่รู้จัก (เช่น emp_001.jpg)
├── encodings/               # 💾 face_encodings (.npy)
│
├── face_recognition_service.py   # 🔁 Flask API main
├── encode_faces.py               # 🧠 แปลงภาพใบหน้า → encoding
├── utils.py                      # 🧩 ชุดฟังก์ชันเปรียบเทียบ
├── requirements.txt              # 📦 รายการไลบรารี
```

---

### 📦 ติดตั้ง & เริ่มใช้งาน

#### 1. สร้าง Python Virtual Environment (แนะนำ)

```bash
python -m venv venv
source venv/bin/activate   # บน Mac / Linux
venv\Scripts\activate      # บน Windows
```

#### 2. ติดตั้ง dependencies

```bash
pip install -r requirements.txt
```

---

### 🧠 เตรียมข้อมูลก่อนใช้งาน

#### 1. วางรูปภาพพนักงานลงใน `known_faces/`

ชื่อไฟล์ควรตั้งเป็น:

```
emp_001.jpg
emp_002.jpg
...
```

#### 2. สร้าง face encodings

```bash
python encode_faces.py
```

จะสร้าง `.npy` ใน `encodings/` เช่น:

```
encodings/emp_001.npy
```

---

### 🚀 เริ่มรัน Flask API

```bash
python face_recognition_service.py
```

หากรันสำเร็จ:

```
🚀 Face Recognition API running on http://localhost:5000
```

---

### 📡 วิธีเรียก API

#### \[POST] `/recognize`

**Request (JSON):**

```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD..."
}
```

หรือแค่ base64 string:

```json
{
  "image": "/9j/4AAQSkZJRgABAQEASABIAAD..."
}
```

**Response:**

```json
{
  "matched": true,
  "name": "emp_001",
  "confidence": 0.43
}
```

---

### 🧪 ทดสอบด้วย curl

```bash
curl -X POST http://localhost:5000/recognize \
  -H "Content-Type: application/json" \
  -d '{"image": "<base64 string>"}'
```

---

### ✨ Optional: ลิงก์กับ Node.js

ให้ Node.js ส่งภาพ base64 ไปยัง `http://localhost:5000/recognize` แล้วนำชื่อพนักงานที่แมตช์ ไปบันทึกในฐานข้อมูล

