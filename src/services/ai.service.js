const { ChatOllama } = require("@langchain/ollama");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const config = require("../config/env");
const logger = require("../utils/logger");

class AIService {
  constructor() {
    this.model = new ChatOllama({
      baseUrl: config.OLLAMA_BASE_URL,
      model: config.MODEL_NAME,
      temperature: 0.7,
    });
    this.parser = new StringOutputParser();
    logger.info(`AI Service initialized with model: ${config.MODEL_NAME}`);
  }

  async generateStream(prompt, context = "") {
    const systemPrompt = `
      You are a Senior Security & Blockchain Architect named Ronisha.
      Use the following retrieved context to answer the user's question. 
      If the context doesn't contain the answer, rely on your internal knowledge but mention that it's not in the docs.
      
      CONTEXT:
      ${context}
    `;

    const stream = await this.model.pipe(this.parser).stream([
      ["system", systemPrompt],
      ["user", prompt]
    ]);

    return stream;
  }
}

module.exports = new AIService();
