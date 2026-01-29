// api/chat.js
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 1. Cek method harus POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 2. Ambil API Key dari Environment Variable Vercel (Aman di server)
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        return res.status(500).json({
            error: 'API Key not configured on server',
            debug: 'GROQ_API_KEY environment variable is missing'
        });
    }

    try {
        // 3. Ambil data pesan dari Frontend
        const { messages, model } = req.body;

        // 4. Kirim request ke Groq (Server to Server)
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: model || "meta-llama/llama-4-scout-17b-16e-instruct",
                messages: messages
            })
        });

        const data = await response.json();

        // 5. Kirim balasan balik ke Frontend
        if (!response.ok) {
            console.error("Groq API Error:", data);
            return res.status(response.status).json({
                error: data.error?.message || 'Groq API Error',
                groq_status: response.status,
                groq_error: data.error || data,
                debug: 'Error from Groq API'
            });
        }

        res.status(200).json(data);

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({
            error: 'Internal Server Error: ' + error.message,
            debug: 'Exception in serverless function'
        });
    }
}