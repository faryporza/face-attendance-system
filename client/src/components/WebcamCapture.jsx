import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';

const WebcamCapture = ({ onCapture, onError, isCapturing = false }) => {
  const webcamRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: 'user',
    deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
  };

  // ดึงรายการกล้อง
  const handleDevices = useCallback((mediaDevices) => {
    const videoDevices = mediaDevices.filter(({ kind }) => kind === 'videoinput');
    setDevices(videoDevices);
    if (videoDevices.length > 0 && !selectedDevice) {
      setSelectedDevice(videoDevices[0].deviceId);
    }
  }, [selectedDevice]);

  React.useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  // ถ่ายรูป
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      // แปลง base64 เป็น blob
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          onCapture(blob);
        })
        .catch(error => {
          console.error('Error converting image:', error);
          onError?.('เกิดข้อผิดพลาดในการถ่ายรูป');
        });
    } else {
      onError?.('ไม่สามารถถ่ายรูปได้');
    }
  }, [onCapture, onError]);

  const handleUserMediaError = (error) => {
    console.error('Webcam error:', error);
    onError?.('ไม่สามารถเข้าถึงกล้องได้ กรุณาตรวจสอบการอนุญาต');
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* เลือกกล้อง */}
      {devices.length > 1 && (
        <div className="w-full max-w-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            เลือกกล้อง
          </label>
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `กล้อง ${device.deviceId.slice(0, 8)}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* กล้อง */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden shadow-lg">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          onUserMediaError={handleUserMediaError}
          className="w-full h-auto"
          style={{ maxWidth: '640px', maxHeight: '480px' }}
        />
        
        {/* โอเวอร์เลย์สำหรับการสแกน */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-64 h-64 border-4 border-white rounded-full opacity-50"></div>
          </div>
          
          {isCapturing && (
            <div className="absolute inset-0 bg-white bg-opacity-30 flex items-center justify-center">
              <div className="text-white text-lg font-semibold">
                กำลังสแกนใบหน้า...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ปุ่มถ่ายรูป */}
      <button
        onClick={capture}
        disabled={isCapturing}
        className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
          isCapturing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300'
        }`}
      >
        {isCapturing ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>กำลังประมวลผล...</span>
          </div>
        ) : (
          'สแกนใบหน้า'
        )}
      </button>

      {/* คำแนะนำ */}
      <div className="text-center text-sm text-gray-600 max-w-md">
        <p>กรุณาวางใบหน้าให้อยู่ในกรอบวงกลม</p>
        <p>และให้แสงเพียงพอสำหรับการสแกน</p>
      </div>
    </div>
  );
};

export default WebcamCapture;