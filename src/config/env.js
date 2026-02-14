const path = require('path');
require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  ENV: process.env.NODE_ENV || 'development',
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  MODEL_NAME: process.env.MODEL_NAME || 'ronisha',
  EMBEDDING_MODEL: process.env.EMBEDDING_MODEL || 'nomic-embed-text',
  KNOWLEDGE_PATH: path.join(process.cwd(), 'knowledge/**/*.md'),
};
