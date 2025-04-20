const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3000;

// יצירת תקייה אם לא קיימת
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// קונפיגורציה
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// הגדרת אחסון התמונות
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// הגדרת Resend עם משתנה סביבה
const resend = new Resend(process.env.RESEND_API_KEY);

// נתיב לשליחת תמונה במייל
app.post('/send', upload.single('photo'), async (req, res) => {
  const email = req.body.email;
  const photoPath = req.file.path;

  try {
    const data = await resend.emails.send({
      from: 'Photobooth <onboarding@resend.dev>', // כתובת מותרת לשימוש ב-Sandbox של Resend
      to: email,
      subject: '📸 הנה התמונה שלך מהעמדה!',
      html: '<p>תודה על הצילום! מצורפת כאן התמונה שלך.</p>',
      attachments: [
        {
          filename: req.file.originalname,
          content: fs.readFileSync(photoPath).toString('base64'),
        },
      ],
    });

    console.log('✅ מייל נשלח:', data);
    res.send('השליחה הצליחה');
  } catch (error) {
    console.error('❌ שגיאה בשליחת המייל:', error);
    res.status(500).send('שליחה נכשלה');
  }
});

// הפעלת השרת
app.listen(PORT, '0.0.0.0', () => {
  console.log(`📸 השרת פעיל על פורט ${PORT}`);
});

