import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Formulardaten aus dem Request-Body extrahieren
        const body = JSON.parse(JSON.stringify(req.body));
        const { name, email, message, 'calculator-data': calculatorData } = body;

        // E-Mail-Transport konfigurieren
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: 'clgunduz@gmail.com',
                pass: process.env.GMAIL_PASSWORD
            }
        });

        // E-Mail-Text formatieren
        function formatCalculatorData(data) {
            try {
                const calc = JSON.parse(data);
                return `
Hallo Chef,

Eine neue Anfrage ist eingegangen:

KONTAKTDATEN:
• Name: ${name}
• E-Mail: ${email}
• Nachricht: ${message}

GEWÄHLTES PAKET:
• ${calc.base === 'basic-website' ? 'Basic Website (399€/Monat)' : 
    calc.base === 'professional-website' ? 'Professional Website (599€/Monat)' : 
    calc.base === 'enterprise-website' ? 'Enterprise Website (999€/Monat)' : calc.base}

ZUSATZMODULE:
${calc.addons.map(addon => '• ' + (
    addon === 'ai-integration' ? 'KI-Integration (+299€/Monat)' :
    addon === 'booking-system' ? 'Online Terminbuchung (+199€/Monat)' :
    addon === 'crm-integration' ? 'CRM & Analytics (+249€/Monat)' :
    addon === 'whatsapp-business' ? 'WhatsApp Business (+99€/Monat)' :
    addon === 'multilingual' ? 'Mehrsprachigkeit (+149€/Monat)' :
    addon === 'workflow-automation' ? 'Workflow Automatisierung (+399€/Monat)' : 
    addon
)).join('\n')}

VERTRAGSINFORMATIONEN:
• Laufzeit: ${calc.contract.duration === 'monthly' ? 'Monatlich' :
            calc.contract.duration === 'annual' ? 'Jährlich (10% Rabatt)' :
            calc.contract.duration === 'biannual' ? '2 Jahre (15% Rabatt)' : 
            calc.contract.duration}

PREISÜBERSICHT:
• Basis-Paket: ${calc.prices.base}€/Monat
• Zusatzmodule: ${calc.prices.addons}€/Monat
• Support: ${calc.prices.support}€/Monat
• Zwischensumme: ${calc.prices.subtotal}€/Monat
${calc.prices.discount > 0 ? `• Rabatt: -${calc.prices.discount}€/Monat` : ''}
• Monatlicher Gesamtpreis: ${calc.prices.total}€
• Einmalige Setup-Gebühr: ${calc.prices.setup}€

Datum der Anfrage: ${new Date(calc.timestamp).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
})} Uhr

Erfolgreichen Tag Dir!`;
            } catch (e) {
                return 'Keine Kalkulator-Daten verfügbar';
            }
        }

        // E-Mail senden
        await transporter.sendMail({
            from: 'clgunduz@gmail.com',
            to: 'clgunduz@gmail.com',
            subject: 'Neue SHK Website-Anfrage',
            text: formatCalculatorData(calculatorData)
        });

        // Erfolgreiche Antwort
        return res.status(200).json({
            success: true,
            message: 'Formular erfolgreich empfangen und E-Mail versendet. Wir melden uns innerhalb von 48 Stunden'
        });

    } catch (error) {
        console.error('Fehler beim Verarbeiten der Anfrage:', error);
        return res.status(500).json({
            success: false,
            error: 'Interner Server-Fehler beim Verarbeiten der Anfrage'
        });
    }
}
