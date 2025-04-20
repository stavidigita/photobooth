const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// הגדרות Multer לשמירת התמונות
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// נתיב לקבלת התמונות ושליחת אימייל
app.post('/send-photo', upload.single('photo'), async (req, res) => {
  const email = req.body.email;
  const photoPath = req.file.path;

  const transporter = nodemailer.createTransport({
    host: 'smtp.mailersend.net',
    port: 587,
    auth: {
      user: 'MS_2N1EUN@test-51ndgwvvrxxlzqx8.mlsender.net', // עדכן לפי הפרטים שלך
      pass: 'mssp.xVwxB2w.vywj2lp7kkjl7oqz.EOWf8lG'
    }
  });

  try {
    await transporter.sendMail({
      from: '"Self-Photobooth" <noreply@photobooth.com>',
      to: email,
      subject: '📸 הנה התמונה שלך!',
      text: 'תודה שצילמת! מצורפת התמונה שלך.',
      attachments: [
        {
          filename: req.file.originalname,
          path: photoPath
        }
      ]
    });

    console.log(`✅ מייל נשלח ל־${email}`);
    res.send('השליחה הצליחה');
  } catch (error) {
    console.error('❌ שגיאה בשליחת המייל:', error);
    res.status(500).send('שליחה נכשלה');
  }
});

// הפעלת השרת (מעודכן ל־0.0.0.0)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`📸 השרת פעיל על פורט ${PORT}`);
});

