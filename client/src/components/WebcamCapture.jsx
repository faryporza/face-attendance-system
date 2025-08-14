import React, { useRef } from 'react';
import Webcam from 'react-webcam';

const WebcamCapture = () => {
  const webcamRef = useRef(null);

  const captureAndSend = async () => {
    const imageSrc = webcamRef.current.getScreenshot();

    // แปลง base64 เป็น blob
    const res = await fetch(imageSrc);
    const blob = await res.blob();

    const formData = new FormData();
    formData.append('image', blob, 'capture.jpg');

    try {
      const response = await fetch('http://localhost:5001/recognize', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('ผลลัพธ์:', data);
    } catch (error) {
      console.error('เกิดข้อผิดพลาด:', error);
    }
  };

  return (
    <div>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={400}
      />
      <br />
      <button onClick={captureAndSend}>📸 ตรวจสอบใบหน้า</button>
    </div>
  );
};

export default WebcamCapture;