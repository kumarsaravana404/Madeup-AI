const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

const authMiddleware = require('../middleware/auth.middleware');

// Chat route
router.post('/chat', authMiddleware, chatController.handleChat);

// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'connected', ollama: 'running', timestamp: new Date() });
});

module.exports = router;
