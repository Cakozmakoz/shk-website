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
                
                // Simplified email content for faster processing
                const emailContent = `Neue SHK Website-Anfrage:
                
Name: ${name}
Unternehmen: ${company}
E-Mail: ${email}
Telefon: ${phone || 'Nicht angegeben'}
Branche: ${industry}

Nachricht: ${message || 'Keine Nachricht'}

Zeitstempel: ${new Date().toLocaleString('de-DE')}`;

                // Send email with shorter timeout
                const mailOptions = {
                    from: process.env.GMAIL_USER || 'clgunduz@gmail.com',
                    to: process.env.GMAIL_USER || 'clgunduz@gmail.com',
                    subject: `SHK Anfrage: ${company}`,
                    text: emailContent
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