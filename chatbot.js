// ==========================================
// 💬 CHATBOT MODULE (chatbot.js)
// ==========================================

let isChatOpen = false;
let isBotThinking = false;

// 1. Toggle Chat Window
function toggleChat() {
    const window = document.getElementById('chat-window');
    const btn = document.querySelector('button[onclick="toggleChat()"]');
    
    isChatOpen = !isChatOpen;
    
    if (isChatOpen) {
        window.classList.add('active');
        btn.classList.add('open');
        setTimeout(() => {
            const input = document.getElementById('chat-input');
            if(input) input.focus();
        }, 300);
    } else {
        window.classList.remove('active');
        btn.classList.remove('open');
    }
}

// 2. Handle Submit Form
async function handleChatSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const message = input.value.trim();

    if (!message || isBotThinking) return;

    // Tampilkan Pesan User
    appendMessage('user', message);
    input.value = '';
    
    setLoadingState(true);

    await fetchBotResponse(message);
    
    setLoadingState(false);
}

// 3. Render Bubble Pesan (BAGIAN INI YANG DIPERBAIKI)
function appendMessage(sender, text) {
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    
    if (sender === 'user') {
        div.className = "flex gap-3 justify-end";
        div.innerHTML = `
            <div class="message-user p-3 text-sm max-w-[80%]">
                ${text}
            </div>
        `;
    } else {
        div.className = "flex gap-3";
        
        // --- PERBAIKAN ERROR "Marked is not defined" ---
        // Kita cek dulu: apakah library 'marked' ada?
        // Kalau ada, pakai format rapi. Kalau tidak, pakai text biasa.
        let formattedText = text;
        try {
            if (typeof marked !== 'undefined') {
                formattedText = marked.parse(text);
            }
        } catch (err) {
            console.warn("Marked library not loaded, using plain text.");
        }
        // -----------------------------------------------

        div.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 text-green-700 font-bold text-xs">AI</div>
            <div class="message-bot p-3 text-sm max-w-[80%]">
                ${formattedText}
            </div>
        `;
    }

    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

// 4. Integrasi API Groq
async function fetchBotResponse(userMessage) {
    const plantContext = (typeof plantDatabase !== 'undefined') 
        ? plantDatabase.map(p => `${p.name} (Needs: ${p.light_needs}, Water: ${p.maintenance})`).join(", ")
        : "No database connected.";

    const systemPrompt = `
        You are Plantify Assistant, a friendly expert botanist.
        You have access to this plant database: [${plantContext}].
        Rules: Keep answers short (max 3 sentences). Use emojis 🌱.
    `;

    try {
        const loadingId = showTypingIndicator();

        // PERUBAHAN DI SINI:
        // Kita fetch ke endpoint lokal kita sendiri "/api/chat"
        // Tidak perlu header Authorization di sini, karena browser tidak pegang key
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
                ]
            })
        });

        removeTypingIndicator(loadingId);

        if (!response.ok) throw new Error("API Error");

        const data = await response.json();
        const botReply = data.choices[0].message.content;

        appendMessage('bot', botReply);

    } catch (error) {
        console.error(error);
        const tempLoader = document.getElementById('temp-loading');
        if(tempLoader) tempLoader.remove();
        
        appendMessage('bot', "Oops! Server trouble. 🌱 Try again later.");
    }
}

// 5. Utilities UI
function setLoadingState(isLoading) {
    isBotThinking = isLoading;
    const btn = document.getElementById('chat-send-btn');
    if(btn) {
        btn.disabled = isLoading;
        if(isLoading) {
            btn.classList.add('opacity-50');
        } else {
            btn.classList.remove('opacity-50');
            const input = document.getElementById('chat-input');
            if(input) input.focus();
        }
    }
}

function showTypingIndicator() {
    const container = document.getElementById('chat-messages');
    const id = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.setAttribute('id', 'temp-loading'); // ID statis untuk safety
    div.className = "flex gap-3";
    div.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 text-green-700 font-bold text-xs">AI</div>
        <div class="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex gap-1 items-center h-10">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return id;
}

function removeTypingIndicator(id) {
    const el = document.getElementById('temp-loading');
    if(el) el.remove();
}