const { OllamaEmbeddings } = require("@langchain/community/embeddings/ollama");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const fs = require("fs").promises;
const path = require("path");
const { glob } = require("glob");
const config = require("../config/env");
const logger = require("../utils/logger");

class RAGService {
  constructor() {
    this.embeddings = new OllamaEmbeddings({
      model: config.EMBEDDING_MODEL,
      baseUrl: config.OLLAMA_BASE_URL,
    });
    this.vectorStore = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    logger.info("🔄 Loading Knowledge Base...");
    
    try {
        // 1. Load Files
        // Use glob to find all MD files in the knowledge directory
        const pattern = config.KNOWLEDGE_PATH.replace(/\\/g, '/'); // Normalize for glob
        
        // Use await glob(pattern) directly as it returns a Promise in newer versions
        const files = await glob(pattern);
        
        if (!files || files.length === 0) {
            logger.warn("No knowledge files found in " + pattern);
            this.isInitialized = true;
            return;
        }

        const docs = [];
        for (const file of files) {
          const content = await fs.readFile(file, "utf-8");
          docs.push({ pageContent: content, metadata: { source: file } });
        }
    
        // 2. Chunking (Critical for RAG)
        const splitter = new RecursiveCharacterTextSplitter({
          chunkSize: 1000,
          chunkOverlap: 200,
        });
        const splitDocs = await splitter.splitDocuments(docs);
    
        // 3. Create Vector Store
        this.vectorStore = await MemoryVectorStore.fromDocuments(
          splitDocs,
          this.embeddings
        );
        
        this.isInitialized = true;
        logger.info(`✅ RAG Service Online: ${splitDocs.length} knowledge chunks indexed from ${files.length} files.`);
    } catch (error) {
        logger.error("Failed to initialize RAG Service:", error);
        // Log stack trace for debugging
        if (error.stack) logger.error(error.stack);
    }
  }

  async retrieveContext(query) {
    if (!this.vectorStore) {
        // Try to initialize again if not already
        await this.initialize();
        if (!this.vectorStore) return ""; 
    }
    
    // Retrieve top 3 most relevant matches
    try {
        const results = await this.vectorStore.similaritySearch(query, 3);
        if (!results || results.length === 0) return "";
        
        return results.map(doc => doc.pageContent).join("\n\n---\n\n");
    } catch (error) {
        logger.error("Error retrieving context:", error);
        return "";
    }
  }
}

module.exports = new RAGService();
