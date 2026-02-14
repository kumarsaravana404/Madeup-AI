const config = require('../config/env');

module.exports = (req, res, next) => {
    // If no API key is configured, skip auth (Development/Demo Mode)
    // In production, you should set API_KEY env var.
    if (!process.env.API_KEY) {
        return next();
    }

    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
    }

    next();
};
