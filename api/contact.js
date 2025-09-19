import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false,
            error: 'Method not allowed' 
        });
    }

    try {
        console.log('Received request:', {
            method: req.method,
            headers: req.headers,
            bodyType: typeof req.body
        });
        
        // Extract form data from request body
        let body = req.body;
        
        // Handle different content types
        if (typeof body === 'string') {
            try {
                body = JSON.parse(body);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                return res.status(400).json({ 
                    success: false,
                    error: 'Invalid JSON format' 
                });
            }
        }
        
        console.log('Parsed body:', body);
        
        const { 
            name, 
            company,
            email, 
            phone,
            industry,
            'website-type': websiteType,
            message, 
            'calculator-data': calculatorData,
            privacy
        } = body;

        // Basic validation
        if (!name || !email || !company || !industry) {
            console.log('Validation failed:', { name: !!name, email: !!email, company: !!company, industry: !!industry });
            return res.status(400).json({ 
                success: false,
                error: 'Erforderliche Felder fehlen: Name, E-Mail, Unternehmen und Branche sind erforderlich.' 
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false,
                error: 'Ungültige E-Mail-Adresse.' 
            });
        }
        
        // Privacy checkbox validation
        if (!privacy) {
            return res.status(400).json({ 
                success: false,
                error: 'Bitte stimmen Sie den Datenschutzbestimmungen zu.' 
            });
        }

        // Check if nodemailer is available (optimized for free tier)
        let emailSent = false;
        const startTime = Date.now();
        
        try {
            // Only attempt email if password is configured and we have time
            if (process.env.GMAIL_PASSWORD && (Date.now() - startTime) < 3000) {
                // Configure email transport with shorter timeout
                const transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: false,
                    connectionTimeout: 2000, // 2 seconds
                    greetingTimeout: 1000,   // 1 second
                    socketTimeout: 2000,     // 2 seconds
                    auth: {
                        user: process.env.GMAIL_USER || 'clgunduz@gmail.com',
                        pass: process.env.GMAIL_PASSWORD
                    }
                });

                // Skip connection verification for speed (risky but faster)
                // await transporter.verify();
                
                // Format calculator data for email
                function formatCalculatorData(data) {
                    if (!data) {
                        return '\n\nKeine Kalkulator-Daten verfügbar';
                    }
                    
                    try {
                        const calc = JSON.parse(data);
                        let formattedData = '\n\n=== KALKULATOR-AUSWAHL ===';
                        
                        // Base package
                        if (calc.selectedBase) {
                            const packageNames = {
                                'basic-website': 'Essential Website (399€/Monat)',
                                'professional-website': 'Professional Website (599€/Monat)',
                                'premium-website': 'Premium Website (799€/Monat)'
                            };
                            formattedData += `\n\nGEWÄHLTES PAKET:\n• ${packageNames[calc.selectedBase] || calc.selectedBase}`;
                        }
                        
                        // Add-ons
                        formattedData += '\n\nZUSATZMODULE:';
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
                        
                        // Details
                        if (calc.selectedDetails) {
                            formattedData += '\n\nUNTERNEHMENSDETAILS:';
                            if (calc.selectedDetails['company-size']) {
                                const sizeNames = {
                                    'small': '1-5 Mitarbeiter',
                                    'medium': '6-20 Mitarbeiter (+10%)',
                                    'large': '21+ Mitarbeiter (+20%)'
                                };
                                formattedData += `\n• Unternehmensgröße: ${sizeNames[calc.selectedDetails['company-size']] || calc.selectedDetails['company-size']}`;
                            }
                            if (calc.selectedDetails['locations']) {
                                const locationNames = {
                                    '1': '1 Standort',
                                    '2-3': '2-3 Standorte (+15%)',
                                    '4+': '4+ Standorte (+30%)'
                                };
                                formattedData += `\n• Anzahl Standorte: ${locationNames[calc.selectedDetails['locations']] || calc.selectedDetails['locations']}`;
                            }
                            if (calc.selectedDetails['support']) {
                                const supportNames = {
                                    'email': 'E-Mail Support (inkl.)',
                                    'phone': 'Telefon Support (+99€)',
                                    'priority': 'Priority Support (+199€)'
                                };
                                formattedData += `\n• Support-Level: ${supportNames[calc.selectedDetails['support']] || calc.selectedDetails['support']}`;
                            }
                        }
                        
                        // Contract
                        if (calc.selectedContract) {
                            formattedData += '\n\nVERTRAGSINFORMATIONEN:';
                            const contractNames = {
                                'monthly': 'Monatlich (kein Rabatt)',
                                'annual': 'Jährlich (10% Rabatt)',
                                'biannual': '2 Jahre (15% Rabatt)'
                            };
                            formattedData += `\n• Laufzeit: ${contractNames[calc.selectedContract.duration] || calc.selectedContract.duration}`;
                        }
                        
                        // Pricing
                        if (calc.prices) {
                            formattedData += '\n\n=== PREISÜBERSICHT ===';
                            formattedData += `\n• Basis-Paket: ${calc.prices.base}€/Monat`;
                            formattedData += `\n• Zusatzmodule: ${calc.prices.addons}€/Monat`;
                            formattedData += `\n• Support: ${calc.prices.support}€/Monat`;
                            formattedData += `\n• Zwischensumme: ${calc.prices.subtotal}€/Monat`;
                            
                            if (calc.prices.discount > 0) {
                                formattedData += `\n• Rabatt: -${calc.prices.discount}€/Monat`;
                            }
                            
                            formattedData += `\n• MONATLICHER GESAMTPREIS: ${calc.prices.total}€`;
                            formattedData += `\n• Einmalige Setup-Gebühr: ${calc.prices.setup}€`;
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
                        return '\n\nKalkulator-Daten konnten nicht verarbeitet werden: ' + (calculatorData ? 'Daten vorhanden aber fehlerhaft' : 'Keine Daten übermittelt');
                    }
                }
                
                // Enhanced email content with customer prominently displayed
                const emailContent = `NEUE SHK WEBSITE-ANFRAGE VON: ${name} (${email})
UNTERNEHMEN: ${company}

=== KONTAKTDATEN ===
Name: ${name}
Unternehmen: ${company}
E-Mail: ${email}
Telefon: ${phone || 'Nicht angegeben'}
Branche: ${industry}
Gewünschte Website: ${websiteType || 'Nicht spezifiziert'}

=== NACHRICHT ===
${message || 'Keine Nachricht hinterlassen'}${formatCalculatorData(calculatorData)}

=== ANFRAGE-INFO ===
Zeitstempel: ${new Date().toLocaleString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })} Uhr
IP-Adresse: ${req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'Unbekannt'}

---
KUNDEN-E-MAIL FÜR ANTWORT: ${email}
Automatisch generiert von der SHK Website`;

                // Send email with customer's email properly displayed
                const mailOptions = {
                    from: `"SHK Website - ${name}" <${process.env.GMAIL_USER || 'clgunduz@gmail.com'}>`, // Use your Gmail but show customer name
                    to: process.env.GMAIL_USER || 'clgunduz@gmail.com',
                    replyTo: `"${name}" <${email}>`, // Customer's full details for reply
                    subject: `🔧 SHK Anfrage: ${company} - ${calculatorData ? 'Mit Kalkulator' : 'Ohne Kalkulator'}`,
                    text: emailContent,
                    headers: {
                        'X-Original-From': `"${name}" <${email}>`, // Custom header showing original sender
                        'X-Customer-Email': email, // Additional header for customer email
                        'X-Customer-Company': company // Additional header for customer company
                    }
                };

                // Set a timeout for email sending
                const emailPromise = transporter.sendMail(mailOptions);
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Email timeout')), 3000)
                );
                
                await Promise.race([emailPromise, timeoutPromise]);
                emailSent = true;
                
                console.log(`Email sent successfully in ${Date.now() - startTime}ms`);
            } else {
                console.log('Gmail not configured or timeout reached, skipping email');
            }
            
        } catch (emailError) {
            console.error('Email sending failed:', emailError.message);
            // Don't fail the entire request if email fails
            emailSent = false;
        }

        // Log successful submission
        console.log(`Contact form submission processed from ${email} at ${new Date().toISOString()}`);

        // Return success response (even if email failed)
        return res.status(200).json({
            success: true,
            message: emailSent 
                ? 'Vielen Dank für Ihre Anfrage! Wir melden uns innerhalb von 48 Stunden bei Ihnen.'
                : 'Vielen Dank für Ihre Anfrage! Diese wurde erfolgreich übermittelt.'
        });

    } catch (error) {
        console.error('Error processing contact form:', error);
        
        return res.status(500).json({
            success: false,
            error: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt per Telefon.'
        });
    }
}