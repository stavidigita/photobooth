const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// מאפשר גישה לקבצי HTML, CSS ו-JS מתוך תיקיית 'public'
app.use(express.static('public'));

// הגדרות שמירה לתמונות מצולמות
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// אם תיקיית 'uploads' לא קיימת – צור אותה
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✉️ הגדרת שליחה דרך MailerSend (SMTP)
const transporter = nodemailer.createTransport({
  host: 'smtp.mailersend.net',
  port: 587,
  secure: false,
  auth: {
    user: 'MS_2N1EUN@test-51ndgwvvrxxlzqx8.mlsender.net',
    pass: 'mssp.xVwxB2w.vywj2lp7kkjl7oqz.EOWf8lG'
  }
});

// נקודת שליחה – מקבלת תמונה וכתובת מייל
app.post('/send-photo', upload.single('photo'), async (req, res) => {
  const email = req.body.email;
  const photoPath = req.file.path;

  const mailOptions = {
    from: 'MS_2N1EUN@test-51ndgwvvrxxlzqx8.mlsender.net', // חייב להיות כתובת מאומתת!
    to: email,
    subject: '📸 התמונה שלך מהעמדה',
    text: 'תודה שצילמת! הנה התמונה ששלחת לעצמך.',
    attachments: [
      {
        filename: 'photo.jpg',
        path: photoPath
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    res.send('📧 התמונה נשלחה בהצלחה!');
  } catch (error) {
    console.error('שגיאה בשליחה:', error);
    res.status(500).send('❌ שליחה נכשלה');
  }
});

// הפעלת השרת
app.listen(PORT, () => {
  console.log(`📡 השרת רץ בכתובת: http://localhost:${PORT}`);
});

