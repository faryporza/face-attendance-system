import React, { useState } from 'react';
import WebcamCapture from '../components/WebcamCapture';
import attendanceService from '../services/attendanceService';

const Home = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'info'

  const handleCapture = async (imageBlob) => {
    setIsCapturing(true);
    setMessage('');

    try {
      const response = await attendanceService.recordAttendance(imageBlob);
      
      if (response.success) {
        setMessageType('success');
        setMessage(`สวัสดี ${response.employee?.name}! บันทึกเวลา${response.type === 'check-in' ? 'เข้างาน' : 'ออกงาน'}เรียบร้อยแล้ว`);
      } else {
        setMessageType('error');
        setMessage(response.message || 'ไม่พบข้อมูลพนักงาน กรุณาลองใหม่อีกครั้ง');
      }
    } catch (error) {
      console.error('Error recording attendance:', error);
      setMessageType('error');
      setMessage(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกเวลา');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleError = (errorMessage) => {
    setMessageType('error');
    setMessage(errorMessage);
  };

  const clearMessage = () => {
    setMessage('');
    setMessageType('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-3xl">📷</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            บันทึกเวลาเข้า-ออกงาน
          </h1>
          <p className="text-gray-600">
            กรุณาสแกนใบหน้าเพื่อบันทึกเวลาการทำงาน
          </p>
        </div>

        {/* Webcam Component */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <WebcamCapture
            onCapture={handleCapture}
            onError={handleError}
            isCapturing={isCapturing}
          />
        </div>

        {/* Message Display */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            messageType === 'success' 
              ? 'bg-green-50 border border-green-300 text-green-700'
              : messageType === 'error'
              ? 'bg-red-50 border border-red-300 text-red-700'
              : 'bg-blue-50 border border-blue-300 text-blue-700'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {messageType === 'success' && (
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {messageType === 'error' && (
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="font-medium">{message}</p>
                </div>
              </div>
              <button
                onClick={clearMessage}
                className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">คำแนะนำการใช้งาน</h3>
          <div className="space-y-3 text-gray-600">
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">1</span>
              <p>ตรวจสอบว่ากล้องทำงานปกติและมีแสงเพียงพอ</p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">2</span>
              <p>วางใบหน้าให้อยู่ในกรอบวงกลมที่กำหนด</p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">3</span>
              <p>กดปุ่ม "สแกนใบหน้า" เพื่อบันทึกเวลา</p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">4</span>
              <p>ระบบจะแสดงผลการบันทึกเวลาอัตโนมัติ</p>
            </div>
          </div>
        </div>

        {/* Current Time Display */}
        <div className="mt-6 text-center">
          <div className="inline-block bg-white rounded-lg shadow px-6 py-3">
            <p className="text-sm text-gray-500">เวลาปัจจุบัน</p>
            <p className="text-xl font-bold text-gray-900">
              {new Date().toLocaleTimeString('th-TH')}
            </p>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString('th-TH', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
