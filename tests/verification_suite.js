const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m",
    bold: "\x1b[1m"
};

const BASE_URL = 'http://localhost:5001';
const API_KEY = process.env.API_KEY || 'production-secret'; // Default to the one we will use

async function runTest(name, fn) {
    process.stdout.write(`${colors.cyan}Testing: ${name}... ${colors.reset}`);
    try {
        await fn();
        console.log(`${colors.green}PASSED ✅${colors.reset}`);
        return true;
    } catch (e) {
        console.log(`${colors.red}FAILED ❌${colors.reset}`);
        console.error(`  ${colors.yellow}Error: ${e.message}${colors.reset}`);
        if (e.cause) console.error(`  ${colors.yellow}Cause: ${e.cause}${colors.reset}`);
        return false;
    }
}

async function main() {
    console.log(`${colors.bold}🚀 Starting Comprehensive System Validation (QA Mode)${colors.reset}\n`);

    let passed = 0;
    let total = 0;

    // 1. Health Check
    total++;
    await runTest("Server Health & Database Connection", async () => {
        const res = await fetch(`${BASE_URL}/api/health`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        
        if (data.status !== 'connected') throw new Error(`API reported status: ${data.status}`);
        if (data.ollama !== 'running') throw new Error(`Ollama is NOT running (status: ${data.ollama})`);
        console.log(`  (Ollama: ${data.ollama}, Timestamp: ${data.timestamp})`);
    });

    // 2. Security: Unauthorized Access (Production Simulation)
    total++;
    await runTest("Security: Reject Unauthorized Access", async () => {
        // Attempt without key
        const res = await fetch(`${BASE_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: "Hacking attempt" })
        });
        
        // If API_KEY is set on server, this should be 401. 
        // If not set (dev mode), it might be 200. We need to know which mode we are testing.
        // For this "Production check", we expect 401.
        if (res.status !== 401) {
             // If it succeeded, check if we expected it to
             // For now, let's assume we WANT it to fail if we are strictly testing production readiness
             throw new Error(`Server allowed access without API Key (Status: ${res.status}). Env var API_KEY might be missing.`);
        }
    });

    // 3. Static Frontend Serving
    total++;
    await runTest("Frontend Static File Serving", async () => {
        const res = await fetch(`${BASE_URL}/`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        if (!text.includes('<!DOCTYPE html>')) throw new Error("Root URL did not return HTML");
        if (!text.includes('id="chat-container"')) throw new Error("HTML missing chat container");
    });

    // 4. Basic AI Chat (Authenticated)
    total++;
    await runTest("Basic AI Chat Response (Authenticated)", async () => {
        const payload = { message: "Hello, are you online?" };
        const res = await fetch(`${BASE_URL}/api/chat`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-api-key': API_KEY 
            },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status} - ${await res.text()}`);
        
        // Stream handling
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            for(const line of lines) {
                 if (line.startsWith('data: ')) {
                    const jsonStr = line.replace('data: ', '').trim();
                    if (jsonStr === '[DONE]') continue;
                    try {
                        const json = JSON.parse(jsonStr);
                        if(json.token) fullText += json.token;
                    } catch(e) {}
                 }
            }
        }
        
        if (fullText.length < 5) throw new Error("AI response too short or empty");
        console.log(`  (Response: "${fullText.substring(0, 50)}...")`);
    });

    // 5. RAG Retrieval Knowledge Check
    total++;
    await runTest("RAG Knowledge Retrieval (Blockchain)", async () => {
        const payload = { message: "Explain the structure of a Decentralized Identifier (DID)." };
        const res = await fetch(`${BASE_URL}/api/chat`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-api-key': API_KEY 
            },
            body: JSON.stringify(payload)
        });
        
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
             const lines = chunk.split('\n');
            for(const line of lines) {
                 if (line.startsWith('data: ')) {
                    const jsonStr = line.replace('data: ', '').trim();
                    if (jsonStr === '[DONE]') continue;
                    try {
                        const json = JSON.parse(jsonStr);
                        if(json.token) fullText += json.token;
                    } catch(e) {}
                 }
            }
        }

        if (!fullText.toLowerCase().includes("did:method:identifier") && !fullText.toLowerCase().includes("decentralized")) {
            throw new Error("Response did not return expected RAG content");
        }
        console.log(`  (Verified RAG content retrieved)`);
    });

    // 6. Anomaly Detection JSON Logic
    total++;
    await runTest("Security Anomaly Detection Logic", async () => {
        const anomalyPayload = `
        Analyze this security event:
        RAG Context: "Login attempts from North Korea are high risk."
        Anomaly Score: 0.99
        Is Anomaly: true
        Features: {"failed_attempts": 100, "location": "North Korea"}
        User Identity: {"user_id": "audit_test", "timestamp": "123456"}
        `;
        
        const res = await fetch(`${BASE_URL}/api/chat`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-api-key': API_KEY 
            },
            body: JSON.stringify({ message: anomalyPayload })
        });

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
         while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
             const lines = chunk.split('\n');
            for(const line of lines) {
                 if (line.startsWith('data: ')) {
                    const jsonStr = line.replace('data: ', '').trim();
                    if (jsonStr === '[DONE]') continue;
                    try {
                        const json = JSON.parse(jsonStr);
                        if(json.token) fullText += json.token;
                    } catch(e) {}
                 }
            }
        }

        // Validate JSON
        try {
            const jsonStart = fullText.indexOf('{');
            const jsonEnd = fullText.lastIndexOf('}') + 1;
            const jsonStr = fullText.slice(jsonStart, jsonEnd);
            
            const data = JSON.parse(jsonStr);
            if (!data.risk_level) throw new Error("Missing 'risk_level' field");
            if (!data.blockchain_audit) throw new Error("Missing 'blockchain_audit' field");
            console.log(`  (Risk: ${data.risk_level}, Audit Hash: ${data.blockchain_audit.raw_hash_input ? 'Present' : 'Missing'})`);
        } catch (e) {
            throw new Error(`Failed to parse AI JSON output: ${e.message}\nRaw Output: ${fullText.substring(0, 100)}...`);
        }
    });

    console.log(`\n${colors.bold}🏁 Validation Complete.${colors.reset}`);
    if (passed === total) {
        console.log(`${colors.green}ALL SYSTEMS OPERATIONAL. READY FOR DEPLOYMENT.${colors.reset}`);
    } else {
        console.log(`${colors.yellow}Some tests failed. Please review logs.${colors.reset}`);
    }
}

main();
