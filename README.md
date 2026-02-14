# Enterprise Secure AI Assistant 🛡️

A production-ready AI Assistant built with **Node.js**, **Express**, **LangChain**, and **Ollama**.  
Specialized in **Cybersecurity**, **Blockchain Identity**, and **Smart Contract Auditing**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-green.svg)
![Status](https://img.shields.io/badge/status-production_ready-success.svg)

## 🚀 Key Features

- **🧠 RAG Engine (Retrieval-Augmented Generation)**: automatically indexes local markdown knowledge for context-aware answers.
- **🔒 Enterprise Security**: Rate limiting, Helmet CSP, strict CORS, and Zod validation.
- **⚡ High Performance**: Streamed responses (SSE) and In-Memory Vector Search.
- **🏗️ Service-Oriented Architecture**: Clean separation of Brain (AI), Memory (RAG), and API (Express).
- **🐳 Production Ready**: Configured for PM2 process management and load balancing.

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **AI Orchestration**: LangChain.js
- **LLM Engine**: Ollama (Local Inference)
- **Vector Search**: MemoryVectorStore (Upgradeable to ChromaDB)
- **Process Manager**: PM2

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/secure-ai-assistant.git
   cd secure-ai-assistant
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Copy `.env.example` to `.env` (or create new):

   ```env
   PORT=3000
   NODE_ENV=production
   OLLAMA_BASE_URL=http://localhost:11434
   MODEL_NAME=ronisha
   EMBEDDING_MODEL=nomic-embed-text
   ```

4. **Install Ollama Models**
   Ensure [Ollama](https://ollama.ai/) is running.
   ```bash
   ollama pull nomic-embed-text
   # pull your chat model if not already present
   ollama pull llama3
   ```

## 🏃‍♂️ Usage

### Development

```bash
npm run dev
```

### Production (PM2)

Start the application in cluster mode:

```bash
npm install -g pm2
pm2 start ecosystem.config.js --env production
```

View logs:

```bash
pm2 logs
```

## 📚 Knowledge Base Setup

Place your markdown files in the `knowledge/` folder. The system automatically indexes them on startup.

- `knowledge/security-protocols.md`
- `knowledge/blockchain-identity.md`

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
