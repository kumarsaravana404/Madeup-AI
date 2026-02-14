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
        // This effectively "trains" the model's context for this specific task.
        
        const systemPrompt = `
You are an expert AI Security Analyst. 
Your task is to analyze login anomalies based on the following examples:

${trainingData.map(item => `
EXAMPLE:
Instruction: ${item.instruction}
Context: ${item.context}
Response: ${item.response}
`).join('\n')}

When you receive a new input with "RAG Context", "Anomaly Score", "Features", and "User Identity Metadata", 
you MUST output a strict JSON response following the format in the examples, carefully respecting the "blockchain_audit" section.
You must act as Ronisha, an expert Security & Blockchain analyst.
        `;

        // Save this system prompt as a new "Modelfile" to create a permanent custom model
        const modelFileContent = `FROM ${this.modelName}\nSYSTEM """${systemPrompt}"""`;
        const modelFilePath = path.join(process.cwd(), 'Modelfile.anomaly');
        
        fs.writeFileSync(modelFilePath, modelFileContent);
        logger.info(`💾 Created Modelfile at ${modelFilePath}`);
        
        // Execute Ollama creat command (requires shell execution)
        // We will return the command for the user to run, or run it via exec if possible.
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
