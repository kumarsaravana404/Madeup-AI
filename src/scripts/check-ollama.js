const http = require('http');
const config = require('../config/env');

const OLLAMA_URL = config.OLLAMA_BASE_URL || 'http://localhost:11434';

console.log(`📡 Checking Ollama connection at ${OLLAMA_URL}...`);

const req = http.get(`${OLLAMA_URL}/api/tags`, (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Ollama is running and accessible.');
    
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const models = JSON.parse(data).models;
            console.log(`📚 Available Models: ${models.map(m => m.name).join(', ')}`);
            
            // Optional: Check if required models exist
            const requiredModels = [config.MODEL_NAME, config.EMBEDDING_MODEL];
            const missing = requiredModels.filter(req => !models.some(m => m.name.includes(req)));
            
            if (missing.length > 0) {
                console.warn(`⚠️  WARNING: Missing models: ${missing.join(', ')}. App may fail to generate responses.`);
                console.warn(`   Run: ollama pull ${missing[0]}`);
            } else {
                console.log('✅ All required models present.');
            }
            process.exit(0);
        } catch (e) {
            console.error('❌ Failed to parse Ollama response:', e);
            process.exit(1);
        }
    });
  } else {
    console.error(`❌ Ollama returned status: ${res.statusCode}`);
    process.exit(1);
  }
});

req.on('error', (e) => {
  console.error(`❌ Could not connect to Ollama at ${OLLAMA_URL}`);
  console.error(`   Error: ${e.message}`);
  console.error('   Please ensure Ollama is installed and running (ollama serve).');
  process.exit(1);
});

req.end();
