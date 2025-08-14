import db from '../config/db.js';

export const getUsers = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
};

export const createUser = async (req, res) => {
  const { name, employee_code, position, department, face_encoding, image_url } = req.body;

  try {
    await db.query(
      'INSERT INTO users (name, employee_code, position, department, face_encoding, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [name, employee_code, position, department, face_encoding, image_url]
    );
    res.status(201).json({ message: 'เพิ่มพนักงานแล้ว' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'ไม่สามารถเพิ่มพนักงานได้' });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'ลบพนักงานแล้ว' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'ไม่สามารถลบพนักงานได้' });
  }
};

