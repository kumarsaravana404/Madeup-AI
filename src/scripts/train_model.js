const fs = require('fs');
const path = require('path');
const { ChatOllama } = require("@langchain/ollama");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const config = require("../config/env");
const logger = require("../utils/logger");

const trainingDataPath = path.join(process.cwd(), 'knowledge/anomaly_training_data.json');

class ModelTrainer {
  constructor() {
    this.modelName = config.MODEL_NAME; // "ronisha"
    this.ollama = new ChatOllama({
        baseUrl: config.OLLAMA_BASE_URL,
        model: this.modelName
    });
  }

  async train() {
    try {
        logger.info(`🚀 Starting fine-tuning simulation for model: ${this.modelName}`);
        
        if (!fs.existsSync(trainingDataPath)) {
            throw new Error(`Training data not found at ${trainingDataPath}`);
        }

        const rawData = fs.readFileSync(trainingDataPath, 'utf-8');
        const trainingData = JSON.parse(rawData);

        logger.info(`📚 Loaded ${trainingData.length} training examples.`);

        // In a real scenario, we would use the Modelfile to fine-tune.
        // For Ollama/LangChain, we construct a "System Prompt" that embeds this knowledge.
        
        const systemPrompt = `
You are Ronisha-Anomaly, a production-grade AI security intelligence assistant.

Your responsibilities:

1. Analyze anomaly detection output from Isolation Forest.
2. Use RAG knowledge context when available.
3. Reference blockchain identity concepts when relevant.
4. Return STRICTLY VALID JSON.
5. Include ALL required fields.
6. Provide technically detailed responses (minimum depth equivalent to 150+ words).

-------------------------------------------------------
INPUT:

RAG Context:
{rag_context}

Anomaly Detection Output:
Score: {anomaly_score}
Is_Anomaly: {is_anomaly}
Features:
{feature_data_json}

User Identity Metadata:
{
  "user_id": "{user_id}",
  "wallet_address": "{wallet_address}",
  "session_id": "{session_id}",
  "timestamp": "{timestamp}"
}

-------------------------------------------------------
INSTRUCTIONS:

- If RAG context contains blockchain content, explicitly reference:
  - DID Structure
  - DID Document
  - Verifiable Credential
  - Authentication Methods
  - Public Keys
  - Service Endpoints

- If anomaly detected, classify attack type:
  - Brute Force
  - Credential Stuffing
  - Bot Activity
  - Suspicious Geolocation
  - Privilege Escalation
  - Session Hijacking

- Risk level must be:
  Low | Medium | High | Critical

- If the input is a conceptual question (e.g. "What is DID?"), provide the detailed answer in the "reasoning" field.
- Always include blockchain audit structure.
- If no anomaly, still return full structure with appropriate reasoning.
- Never return plain text.
- Never omit fields.
- Never truncate output.
- If data missing, use empty string "" or empty array [].

-------------------------------------------------------
OUTPUT FORMAT (STRICT JSON ONLY):

{
  "attack_type": "",
  "risk_level": "",
  "confidence_score": "",
  "reasoning": "",
  "feature_analysis": {
    "suspicious_features": [],
    "normal_features": []
  },
  "mitigation_steps": [],
  "soc_alert_level": "",
  "blockchain_audit": {
    "raw_hash_input": "",
    "anchor_recommendation": "",
    "why_blockchain_logging_is_needed": ""
  }
}

${trainingData.map(item => `
EXAMPLE:
Instruction: ${item.instruction}
Context: ${item.context}
Response: ${item.response}
`).join('\n')}
        `;

        // Save this system prompt as a new "Modelfile" to create a permanent custom model
        const modelFileContent = `FROM ${this.modelName}\nSYSTEM """${systemPrompt}"""`;
        const modelFilePath = path.join(process.cwd(), 'Modelfile.anomaly');
        
        fs.writeFileSync(modelFilePath, modelFileContent);
        logger.info(`💾 Created Modelfile at ${modelFilePath}`);
        
        // Execute Ollama creat command (requires shell execution)
        return `ollama create ${this.modelName}-anomaly -f Modelfile.anomaly`;

    } catch (error) {
        logger.error("Training failed:", error);
        throw error;
    }
  }
}

// Execute if run directly
if (require.main === module) {
    new ModelTrainer().train().then(cmd => {
        console.log("To finalize training, run:", cmd);
    });
}

module.exports = new ModelTrainer();
