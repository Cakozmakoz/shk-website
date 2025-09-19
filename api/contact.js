import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Extract form data from request body
        let body;
        if (typeof req.body === 'string') {
            body = JSON.parse(req.body);
        } else {
            body = req.body;
        }
        
        const { 
            name, 
            company,
            email, 
            phone,
            industry,
            'website-type': websiteType,
            message, 
            'calculator-data': calculatorData 
        } = body;

        // Basic validation
        if (!name || !email || !company || !industry) {
            return res.status(400).json({ 
                success: false,
                error: 'Required fields missing: name, email, company, and industry are required' 
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false,
                error: 'Invalid email address' 
            });
        }

        // Configure email transport
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: 'clgunduz@gmail.com',
                pass: process.env.GMAIL_PASSWORD
            }
        });

        // Test connection
        await transporter.verify();

        // Format calculator data for email
        function formatCalculatorData(data) {
            if (!data) {
                return 'Keine Kalkulator-Daten verfügbar';
            }
            
            try {
                const calc = JSON.parse(data);
                let formattedData = `\n\nGEWÄHLTES PAKET:\n• ${calc.selectedBase === 'basic-website' ? 'Essential Website (399€/Monat)' : 
    calc.selectedBase === 'professional-website' ? 'Professional Website (599€/Monat)' : 
    calc.selectedBase === 'premium-website' ? 'Premium Website (799€/Monat)' : calc.selectedBase || 'Nicht ausgewählt'}\n\nZUSATZMODULE:`;

                if (calc.selectedAddons && calc.selectedAddons.length > 0) {
                    calc.selectedAddons.forEach(addon => {
                        const addonNames = {
                            'ai-integration': 'KI-Integration (+299€/Monat)',
                            'booking-system': 'Online Terminbuchung (+199€/Monat)',
                            'crm-integration': 'CRM & Analytics (+249€/Monat)',
                            'whatsapp-integration': 'WhatsApp Business (+99€/Monat)',
                            'multilingual': 'Mehrsprachigkeit (+149€/Monat)',
                            'workflow-automation': 'Workflow Automatisierung (+399€/Monat)'
                        };
                        formattedData += `\n• ${addonNames[addon.addon] || addon.addon}`;
                    });
                } else {
                    formattedData += '\n• Keine Zusatzmodule ausgewählt';
                }

                if (calc.selectedContract) {
                    formattedData += `\n\nVERTRAGSINFORMATIONEN:\n• Laufzeit: ${calc.selectedContract.duration === 'monthly' ? 'Monatlich' :
                        calc.selectedContract.duration === 'annual' ? 'Jährlich (10% Rabatt)' :
                        calc.selectedContract.duration === 'biannual' ? '2 Jahre (15% Rabatt)' : 
                        calc.selectedContract.duration}`;
                }

                if (calc.prices) {
                    formattedData += `

PREISÜBERSICHT:
• Basis-Paket: ${calc.prices.base}€/Monat
• Zusatzmodule: ${calc.prices.addons}€/Monat
• Support: ${calc.prices.support}€/Monat
• Zwischensumme: ${calc.prices.subtotal}€/Monat`;
                    
                    if (calc.prices.discount > 0) {
                        formattedData += `\n• Rabatt: -${calc.prices.discount}€/Monat`;
                    }
                    
                    formattedData += `\n• Monatlicher Gesamtpreis: ${calc.prices.total}€\n• Einmalige Setup-Gebühr: ${calc.prices.setup}€`;
                }

                if (calc.timestamp) {
                    formattedData += `\n\nKonfigurations-Zeitstempel: ${new Date(calc.timestamp).toLocaleString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })} Uhr`;
                }

                return formattedData;
            } catch (e) {
                console.error('Error parsing calculator data:', e);
                return 'Kalkulator-Daten konnten nicht verarbeitet werden';
            }
        }

        // Format industry names
        const industryNames = {
            'shk': 'SHK (Sanitär, Heizung, Klima)',
            'sanitaer': 'Sanitär / Installateur',
            'heizung': 'Heizungsbau / Heizungstechnik',
            'klima': 'Klimatechnik / Lüftung',
            'elektrik': 'Elektrik / Elektroinstallation',
            'baugewerbe': 'Baugewerbe allgemein',
            'andere': 'Andere Handwerksbranche'
        };

        const websiteTypeNames = {
            'neue-website': 'Neue SHK Webseite erstellen',
            'website-redesign': 'Handwerker Website überarbeiten',
            'ki-integration': 'KI-Integration in bestehende Website',
            'vollservice': 'Komplette Digitalisierung Handwerksbetrieb'
        };

        // Compose email content
        const emailContent = `Hallo Team,

Eine neue SHK Website-Anfrage ist eingegangen:

KONTAKTDATEN:
• Name: ${name}
• Unternehmen: ${company}
• E-Mail: ${email}
• Telefon: ${phone || 'Nicht angegeben'}
• Branche: ${industryNames[industry] || industry}
• Gewünschte Website: ${websiteTypeNames[websiteType] || websiteType || 'Nicht spezifiziert'}

NACHRICHT:
${message || 'Keine Nachricht hinterlassen'}
${formatCalculatorData(calculatorData)}

Anfrage-Zeitstempel: ${new Date().toLocaleString('de-DE', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })} Uhr\n\nViele Grüße,\nIhr automatisches Benachrichtigungssystem`;

        // Send email
        const mailOptions = {
            from: 'clgunduz@gmail.com',
            to: 'clgunduz@gmail.com',
            subject: `Neue SHK Website-Anfrage von ${company}`,
            text: emailContent
        };

        await transporter.sendMail(mailOptions);

        // Log successful submission (for debugging)
        console.log(`New contact form submission from ${email} at ${new Date().toISOString()}`);

        // Return success response
        return res.status(200).json({
            success: true,
            message: 'Vielen Dank für Ihre Anfrage! Wir melden uns innerhalb von 48 Stunden bei Ihnen.'
        });

    } catch (error) {
        console.error('Error processing contact form:', error);
        
        // Return different error messages based on error type
        if (error.code === 'EAUTH' || error.code === 'ECONNECTION') {
            return res.status(500).json({
                success: false,
                error: 'E-Mail-Service temporär nicht verfügbar. Bitte versuchen Sie es später noch einmal oder kontaktieren Sie uns direkt.'
            });
        }
        
        return res.status(500).json({
            success: false,
            error: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt.'
        });
    }
}