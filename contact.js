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
    // ...weitere Felder nach Bedarf...

    // Hier könntest du z.B. mit nodemailer eine Mail versenden
    // Beispiel: Nur Erfolg zurückgeben
    res.status(200).json({ success: true, message: 'Formular erfolgreich empfangen.', calculatorData, name, email, message });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}