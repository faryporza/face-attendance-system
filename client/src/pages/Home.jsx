import React, { useState } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const Home = () => {
  const webcamRef = React.useRef(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const capture = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setLoading(true);
    try {
      const formData = new FormData();
      const blob = await (await fetch(imageSrc)).blob();
      formData.append('image', blob, 'capture.jpg');

      const res = await axios.post('http://localhost:5001/recognize', formData);
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setResult({ error: 'การตรวจสอบใบหน้าไม่สำเร็จ' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">📸 สแกนใบหน้า</h2>
      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={320}
        height={240}
        className="border rounded"
      />
      <div className="mt-4">
        <button
          onClick={capture}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          ตรวจสอบใบหน้า
        </button>
      </div>
      {loading && <p className="mt-2">⏳ กำลังประมวลผล...</p>}
      {result && (
        <div className="mt-4 p-2 bg-gray-100 rounded">
          {result.name ? (
            <p>✅ ยินดีต้อนรับ: <strong>{result.name}</strong></p>
          ) : (
            <p>❌ ไม่พบข้อมูลใบหน้านี้</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
