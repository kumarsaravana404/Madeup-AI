const { ChatOllama } = require("@langchain/ollama");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const config = require("../config/env");
const logger = require("../utils/logger");

class AIService {
  constructor() {
    // Use the specialized model if available, otherwise fallback
    this.modelName = `${config.MODEL_NAME}-anomaly`; 
    this.model = new ChatOllama({
      baseUrl: config.OLLAMA_BASE_URL,
      model: this.modelName, 
      temperature: 0.2, // Lower temperature for analytical/structured tasks
      format: "json", // Force JSON output
    });
    this.parser = new StringOutputParser();
    logger.info(`AI Service initialized with specialized model: ${this.modelName}`);
  }

  async generateStream(prompt, context = "") {
    // The model is now "trained" via the System Prompt in the Modelfile.
    // We just need to pass the user input.
    
    // Fallback logic if the custom model isn't created yet is handled by Ollama (it might fail if not found).
    // Ideally, we check if model exists, but for now we assume the user runs the training script.

    const stream = await this.model.pipe(this.parser).stream([
      ["user", prompt]
    ]);

    return stream;
  }
}

module.exports = new AIService();
