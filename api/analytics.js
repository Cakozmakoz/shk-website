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
        const { event, parameters, timestamp, url } = req.body;
        
        // Log analytics event (in production, you'd send to analytics service)
        console.log('Analytics Event:', {
            event,
            parameters,
            timestamp,
            url,
            userAgent: req.headers['user-agent'],
            ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
        });
        
        // Return success (don't fail if analytics doesn't work)
        return res.status(200).json({ success: true });
        
    } catch (error) {
        console.error('Analytics error:', error);
        // Always return success for analytics to not break user experience
        return res.status(200).json({ success: true });
    }
}