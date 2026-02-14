const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

// Chat route
router.post('/chat', chatController.handleChat);

// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'connected', ollama: 'running', timestamp: new Date() });
});

module.exports = router;
