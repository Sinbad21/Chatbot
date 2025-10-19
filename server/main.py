from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from server.schemas import ChatRequest, ChatResponse
from server.rag import rag_pipeline
from vectorstore.faiss_store import FAISSStore
from openai import OpenAI
import os
from server.secure_config import SecureConfig

# Load environment variables
if os.path.exists('.env'):
    from dotenv import load_dotenv
    load_dotenv()

print("🔧 Initializing FastAPI app...")
app = FastAPI()

# Temporarily disable CORS for testing
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

store = None

# === INTERFACCIA CHAT HTML ===
@app.get("/", response_class=HTMLResponse)
def chat_interface():
    html_content = """
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Assistente Documenti</title>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        /* === STILI CSS === */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #ffffff;
            color: #1a1a1a;
            line-height: 1.6;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .header {
            background-color: #ffffff;
            border-bottom: 1px solid #e5e5e5;
            padding: 1.5rem 0;
            text-align: center;
        }

        .header h1 {
            font-size: 1.75rem;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 0.5rem;
        }

        .header p {
            font-size: 1rem;
            color: #666666;
            font-weight: 400;
        }

        .container {
            flex: 1;
            max-width: 900px;
            width: 100%;
            margin: 0 auto;
            padding: 2rem 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 2rem;
        }

        .chat-area {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            min-height: 500px;
        }

        .messages {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            padding: 1rem 0;
            overflow-y: auto;
            max-height: calc(100vh - 300px);
        }

        .message {
            display: flex;
            animation: slideIn 0.4s ease-out;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .message.bot {
            justify-content: flex-start;
        }

        .message.user {
            justify-content: flex-end;
        }

        .message-content {
            max-width: 70%;
            padding: 1rem 1.25rem;
            border-radius: 16px;
            font-size: 1rem;
            line-height: 1.6;
            word-wrap: break-word;
        }

        .message.bot .message-content {
            background-color: #f3f3f3;
            color: #1a1a1a;
            border-bottom-left-radius: 4px;
        }

        .message.user .message-content {
            background-color: #dcefff;
            color: #1a1a1a;
            border-bottom-right-radius: 4px;
        }

        .message.typing .message-content {
            background-color: #f8f8f8;
            color: #666666;
            font-style: italic;
        }

        .message-label {
            font-size: 0.875rem;
            font-weight: 600;
            color: #666666;
            margin-bottom: 0.5rem;
            padding: 0 1.25rem;
        }

        .input-area {
            background-color: #ffffff;
            border-top: 1px solid #e5e5e5;
            padding: 1.5rem 0;
        }

        .input-container {
            display: flex;
            gap: 1rem;
            align-items: flex-end;
            max-width: 900px;
            margin: 0 auto;
            padding: 0 1.5rem;
        }

        .input-wrapper {
            flex: 1;
            position: relative;
        }

        #message-input {
            width: 100%;
            padding: 1rem 1.25rem;
            border: 2px solid #e5e5e5;
            border-radius: 12px;
            font-size: 1rem;
            font-family: inherit;
            resize: none;
            min-height: 20px;
            max-height: 120px;
            transition: border-color 0.2s ease;
            background-color: #ffffff;
            color: #1a1a1a;
        }

        #message-input:focus {
            outline: none;
            border-color: #007aff;
        }

        #message-input::placeholder {
            color: #999999;
        }

        .input-hint {
            font-size: 0.875rem;
            color: #999999;
            margin-top: 0.5rem;
            padding-left: 1.25rem;
        }

        #send-button {
            padding: 1rem 2rem;
            background-color: #007aff;
            color: #ffffff;
            border: none;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            white-space: nowrap;
            min-width: 100px;
        }

        #send-button:hover:not(:disabled) {
            background-color: #0056cc;
            transform: translateY(-1px);
        }

        #send-button:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
            transform: none;
        }

        .loading-dots {
            display: inline-flex;
            gap: 4px;
            align-items: center;
        }

        .loading-dots span {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: #ffffff;
            animation: loading 1.4s ease-in-out infinite both;
        }

        .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
        .loading-dots span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes loading {
            0%, 80%, 100% {
                transform: scale(0);
                opacity: 0.5;
            }
            40% {
                transform: scale(1);
                opacity: 1;
            }
        }

        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }

            .input-container {
                padding: 0;
                flex-direction: column;
                gap: 0.75rem;
            }

            #send-button {
                width: 100%;
            }

            .message-content {
                max-width: 85%;
            }

            .header {
                padding: 1rem 0;
            }

            .header h1 {
                font-size: 1.5rem;
            }
        }

        @media (max-width: 480px) {
            .container {
                padding: 0.75rem;
            }

            .messages {
                gap: 1rem;
            }

            .message-content {
                padding: 0.875rem 1rem;
                font-size: 0.95rem;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Assistente Documenti</h1>
        <p>Come posso aiutarti con il manuale della stazione di pompaggio?</p>
    </div>

    <div class="container">
        <div class="chat-area">
            <div class="messages" id="chat-messages">
                <div class="message bot">
                    <div class="message-content">
                        Ciao! Sono qui per aiutarti con qualsiasi domanda sui documenti che hai caricato.
                        Puoi chiedermi informazioni specifiche sul manuale della stazione di pompaggio.
                    </div>
                </div>
            </div>
        </div>

        <div class="input-area">
            <div class="input-container">
                <div class="input-wrapper">
                    <textarea
                        id="message-input"
                        placeholder="Scrivi la tua domanda..."
                        rows="1"
                    ></textarea>
                    <div class="input-hint">Premi Invio per inviare • Shift+Invio per andare a capo</div>
                </div>
                <button id="send-button" type="button">
                    <span id="button-text">Invia</span>
                </button>
            </div>
        </div>
    </div>

    <!-- === SCRIPT JS === -->
    <script>
        const messageInput = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button');
        const buttonText = document.getElementById('button-text');
        const chatMessages = document.getElementById('chat-messages');

        let isTyping = false;

        // Auto-resize textarea
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });

        // Send message on Enter (but not Shift+Enter)
        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // Send button click
        sendButton.addEventListener('click', sendMessage);

        async function sendMessage() {
            const message = messageInput.value.trim();
            if (!message || isTyping) return;

            // Add user message
            addMessage(message, 'user');
            messageInput.value = '';
            messageInput.style.height = 'auto';

            // Show typing indicator
            showTyping();

            try {
                const response = await fetch('/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: message })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                hideTyping();
                addMessage(data.answer, 'bot');

            } catch (error) {
                console.error('Error:', error);
                hideTyping();
                if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                    addMessage('Errore di connessione. Assicurati che il server sia in esecuzione e riprova.', 'bot');
                } else {
                    addMessage('Si è verificato un errore. Riprova più tardi.', 'bot');
                }
            }
        }

        function addMessage(text, type) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${type}`;

            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            contentDiv.textContent = text;

            messageDiv.appendChild(contentDiv);
            chatMessages.appendChild(messageDiv);
            scrollToBottom();
        }

        function showTyping() {
            isTyping = true;
            sendButton.disabled = true;
            buttonText.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';

            const typingDiv = document.createElement('div');
            typingDiv.className = 'message bot typing';
            typingDiv.id = 'typing-indicator';

            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            contentDiv.textContent = 'Assistente sta scrivendo...';

            typingDiv.appendChild(contentDiv);
            chatMessages.appendChild(typingDiv);
            scrollToBottom();
        }

        function hideTyping() {
            isTyping = false;
            sendButton.disabled = false;
            buttonText.textContent = 'Invia';

            const typingIndicator = document.getElementById('typing-indicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
        }

        function scrollToBottom() {
            setTimeout(() => {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 100);
        }

        // Focus on input when page loads
        window.addEventListener('load', () => {
            messageInput.focus();
        });
    </script>
</body>
</html>
    """
    return HTMLResponse(content=html_content)

def get_api_key():
    print("🔑 Getting API key...")
    encrypted_key = os.getenv("OPENAI_API_KEY_ENCRYPTED")
    if encrypted_key:
        config = SecureConfig()
        return config.decrypt(encrypted_key)
    else:
        return os.getenv("OPENAI_API_KEY")

@app.get("/healthz")
def health():
    print("💚 Health check called")
    return {"status": "ok"}

@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    print(f"💬 Chat request: {req.message[:50]}...")
    global store
    if store is None:
        print("🏪 Initializing FAISS vector store...")
        store = FAISSStore()
        store.load()  # Carica l'indice salvato
    api_key = get_api_key()
    if not api_key:
        raise HTTPException(status_code=500, detail="API key not configured")
    client = OpenAI(api_key=api_key)
    answer, citations = rag_pipeline(req.message, store, client)
    return ChatResponse(answer=answer, citations=citations)

@app.post("/ingest/reload")
def reload():
    global store
    store = FAISSStore()
    store.load()
    return {"status": "reloaded"}

print("✅ Server initialized successfully")