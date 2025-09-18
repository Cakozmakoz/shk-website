import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Die Formulardaten auslesen
    let body = '';
    await new Promise((resolve) => {
      req.on('data', chunk => { body += chunk; });
      req.on('end', resolve);
    });

    // Die Daten parsen (URL-encoded)
    const params = new URLSearchParams(body);
    const calculatorData = params.get('calculator-data');
    const name = params.get('name');
    const email = params.get('email');
    const message = params.get('message');

    // Transporter konfigurieren
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'clgunduz@gmail.com',
        pass: process.env.GMAIL_PASSWORD // Hier dein App-Passwort als Umgebungsvariable
      }
    });

    // E-Mail-Inhalt
    const mailOptions = {
      from: 'clgunduz@gmail.com',
      to: 'clgunduz@gmail.com',
      subject: 'Neue SHK Anfrage von Website',
      text: `
Name: ${name}
E-Mail: ${email}
Nachricht: ${message}

Kalkulator-Daten:
${calculatorData}
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ success: true, message: 'Formular erfolgreich empfangen und E-Mail versendet. Wir melden uns innerhalb von 48 Stunden' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
