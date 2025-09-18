import nodemailer from 'nodemailer';

function formatCalculatorData(data) {
    try {
        const calc = JSON.parse(data);
        return `
GEWÄHLTES PAKET:
• ${calc.base === 'basic-website' ? 'Basic Website' : 
    calc.base === 'professional-website' ? 'Professional Website' : 
    calc.base === 'enterprise-website' ? 'Enterprise Website' : calc.base}

ZUSATZMODULE:
${calc.addons.map(addon => '• ' + (
    addon === 'ai-integration' ? 'KI-Integration' :
    addon === 'booking-system' ? 'Online Terminbuchung' :
    addon === 'crm-integration' ? 'CRM & Analytics' :
    addon === 'whatsapp-business' ? 'WhatsApp Business' :
    addon === 'multilingual' ? 'Mehrsprachigkeit' :
    addon === 'workflow-automation' ? 'Workflow Automatisierung' : 
    addon
)).join('\n')}
`;
    } catch (error) {
        console.error('Error parsing calculator data:', error);
        return 'Fehler beim Verarbeiten der Kalkulator-Daten.';
    }
}

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
${formatCalculatorData(calculatorData)}
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
