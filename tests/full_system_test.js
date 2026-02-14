const fetch = require('node-fetch'); // Ensure node-fetch is available (v2 for CommonJS or dynamic import)

// We'll use dynamic import for node-fetch or standard fetch if Node 18+
const API_URL = 'http://localhost:3000/api/chat';

async function sendTestRequest(scenarioName, payload) {
    console.log(`\n🧪 Testing Scenario: ${scenarioName}...`);
    console.log(`Payload: ${JSON.stringify(payload, null, 2)}`);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: payload })
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        // Handle SSE stream - this is a bit complex in a simple script, 
        // but for the sake of the test we can just read the whole text.
        // However, the backend sends "data: {token}" lines. 
        // We need to accumulate tokens to get the full JSON.
        
        const text = await response.text();
        const lines = text.split('\n');
        let fullResponse = "";

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const dataStr = line.replace('data: ', '').trim();
                if (dataStr === '[DONE]') continue;
                try {
                    const data = JSON.parse(dataStr);
                     // The backend sends { token: "..." } or { done: true }
                    if (data.token) {
                        fullResponse += data.token;
                    }
                } catch (e) {
                    // Ignore parsing errors for intermediate lines
                }
            }
        }

        console.log(`\n📝 Raw Model Output:\n${fullResponse}`);

        // Validation
        const jsonResponse = JSON.parse(fullResponse);
        console.log("\n✅ Valid JSON format detected.");

        if (jsonResponse.blockchain_audit) {
            console.log("✅ Blockchain Audit Data present.");
            console.log(`   Hash Input: ${jsonResponse.blockchain_audit.raw_hash_input}`);
        } else {
            console.log("❌ Missing 'blockchain_audit' field!");
        }

        console.log(`Risk Level: ${jsonResponse.risk_level}`);
        
    } catch (error) {
        console.error(`❌ Test Failed: ${error.message}`);
    }
}

async function runTests() {
    // SCENARIO 1: High Risk Anomaly
    const attackPrompt = `
Analyze this anomaly:
RAG Context: "Multiple failed login attempts from different IPs suggest distributed brute force."
Anomaly Score: 0.95
Is Anomaly: true
Features: {"failed_attempts": 50, "location": "Unknown Proxy", "velocity": "High"}
User Identity Metadata: {
  "user_id": "admin_01",
  "wallet_address": "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
  "session_id": "sess_alert_99",
  "timestamp": "1739500000"
}
`;

    await sendTestRequest("Critical Brute Force Attack", attackPrompt);

    // SCENARIO 2: Normal Behavior
    const normalPrompt = `
Analyze this event:
RAG Context: "User strictly logs in from California."
Anomaly Score: 0.12
Is Anomaly: false
Features: {"failed_attempts": 0, "location": "California, USA", "velocity": "Normal"}
User Identity Metadata: {
  "user_id": "user_alice",
  "wallet_address": "0x123...abc",
  "session_id": "sess_ok_11",
  "timestamp": "1739500000"
}
`;

    // Wait a bit to not overwhelm local Ollama
    await new Promise(r => setTimeout(r, 2000));
    await sendTestRequest("Normal User Login", normalPrompt);
}

runTests();
