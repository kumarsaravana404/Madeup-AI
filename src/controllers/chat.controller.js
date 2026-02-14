const aiService = require('../services/ai.service');
const ragService = require('../services/rag.service');
const logger = require('../utils/logger');

exports.handleChat = async (req, res) => {
  const { message } = req.body;

  if (!message) {
      return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // 1. Retrieve Knowledge
    // "Smart retrieval" - only use RAG if query is technical or specific
    // For now, we always retrieve to be safe, but you can add logic here.
    const context = await ragService.retrieveContext(message);
    
    if (context) {
        logger.info(`Retrieved ${context.length} chars of context for query: "${message.substring(0, 50)}..."`);
    } else {
        logger.info(`No context found for query: "${message.substring(0, 50)}..."`);
    }

    // 2. Init Stream
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const stream = await aiService.generateStream(message, context);

    // 3. Pipe to client
    for await (const chunk of stream) {
      // Chunk is already a string from StringOutputParser
      const token = typeof chunk === 'string' ? chunk : JSON.stringify(chunk);
      res.write(`data: ${JSON.stringify({ token })}\n\n`);
    }
    
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

  } catch (error) {
    logger.error("Pipeline Error:", error);
    // If headers are already sent, we can't send JSON error
    if (!res.headersSent) {
        res.status(500).json({ error: "System Malfunction" });
    } else {
        res.write(`data: ${JSON.stringify({ error: "Stream Error" })}\n\n`);
        res.end();
    }
  }
};
