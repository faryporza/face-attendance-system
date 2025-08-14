import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const TEST_IMAGE_PATH = path.resolve(process.cwd(), 'test.jpg'); // place test.jpg in server folder or adjust path

async function sendImage() {
  if (!fs.existsSync(TEST_IMAGE_PATH)) {
    console.error(`Test image not found at ${TEST_IMAGE_PATH}`);
    process.exit(1);
  }

  const form = new FormData();
  form.append('image', fs.createReadStream(TEST_IMAGE_PATH));

  const pythonUrl = (process.env.PYTHON_SERVICE_URL || 'http://localhost:5001').replace(/\/$/, '') + '/recognize';

  try {
    console.log(`Sending ${TEST_IMAGE_PATH} to ${pythonUrl}`);
    const res = await axios.post(pythonUrl, form, {
      headers: form.getHeaders(),
      timeout: 15000,
    });
    console.log('Response:', res.status, res.data);
  } catch (err) {
    console.error('Error:', err.response?.status, err.response?.data || err.message);
    process.exit(1);
  }
}

sendImage();
