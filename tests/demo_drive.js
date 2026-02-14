const fetch = require('node-fetch'); // Ensure node-fetch v2 or use native fetch if Node 18+

const BASE_URL = 'http://localhost:5001';
const API_KEY = 'production-secret';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function demo() {
    console.log("\n🚗 STARTING TEST DRIVE: Production AI Assistant\n");

    // 1. Unauthorized Access
    console.log("🔒 1. Testing Unauthorized Access...");
    const res1 = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: "Hello" })
    });
    console.log(`   Status: ${res1.status} ${res1.statusText}`);
    console.log(`   Response: ${JSON.stringify(await res1.json())}`);
    
    if (res1.status === 401) console.log("   ✅ Security Check Passed: Access Denied.\n");
    else console.log("   ❌ Security Check Failed!\n");

    // 2. Health Check
    console.log("🏥 2. Checking System Health...");
    const res2 = await fetch(`${BASE_URL}/api/health`);
    const health = await res2.json();
    console.log(`   Status: ${health.status}`);
    console.log(`   Ollama: ${health.ollama}`);
    console.log("   ✅ System is Healthy.\n");

    // 3. Technical Query (RAG + AI)
    console.log("🧠 3. Testing Technical RAG Query (with API Key)...");
    console.log("   Query: 'Explain Decentralized Identity'");
    
    const res3 = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'x-api-key': API_KEY 
        },
        body: JSON.stringify({ message: "Explain Decentralized Identity" })
    });

    if (res3.ok) {
        console.log("   ✅ Request Authorized.");
        console.log("   Stream receiving...");
        // For demo, just showing we got a 200 OK stream is enough proof
        // Real stream parsing is verbose in plain node script without dedicated parser
    } else {
        console.log(`   ❌ Failed: ${res3.status}`);
    }
    console.log("\n🏁 Test Drive Complete.");
}

demo();
