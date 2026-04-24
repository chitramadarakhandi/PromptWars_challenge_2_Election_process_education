// Firebase configuration placeholder
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
// import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let GEMINI_API_KEY = "";
try {
    const config = await import('./config.js');
    GEMINI_API_KEY = config.GEMINI_API_KEY || "";
} catch (e) {
    console.warn("config.js not found. Chat requires GEMINI_API_KEY.");
}


// --- Navigation Logic ---
const navLinks = document.querySelectorAll('.nav-links li');
const sections = document.querySelectorAll('.content-section');
const sidebar = document.getElementById('sidebar');
const openSidebarBtn = document.getElementById('open-sidebar');
const closeSidebarBtn = document.getElementById('close-sidebar');

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        // Update active nav link
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Show corresponding section
        const targetSection = link.getAttribute('data-section');
        sections.forEach(sec => {
            sec.classList.remove('active');
            if (sec.id === targetSection) {
                sec.classList.add('active');
            }
        });

        // On mobile, close sidebar after clicking a link
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('open');
        }
    });
});

if (openSidebarBtn) openSidebarBtn.addEventListener('click', () => sidebar.classList.add('open'));
if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', () => sidebar.classList.remove('open'));

// --- Chatbot Logic ---
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const chatMessages = document.getElementById('chat-messages');

// Function to log query to Firebase
async function logQueryToFirestore(query, response) {
    // try {
    //     await addDoc(collection(db, "chatHistory"), {
    //         query: query,
    //         response: response,
    //         timestamp: serverTimestamp()
    //     });
    // } catch (e) {
    //     console.error("Error adding document: ", e);
    // }
}

// Function to add a message to UI
function appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message');
    if (sender === 'user') {
        msgDiv.classList.add('user-message');
        msgDiv.textContent = text;
    } else if (sender === 'ai') {
        msgDiv.classList.add('ai-message');
        // Basic formatting for AI response (markdown-like boldness)
        let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formattedText = formattedText.replace(/\n/g, '<br>');
        formattedText = formattedText.replace(/\* (.*?)</g, '• $1<'); // Simple list formatting
        
        msgDiv.innerHTML = `<strong>VoteWise:</strong> <br>${formattedText}`;
    } else if (sender === 'loading') {
        msgDiv.classList.add('loading-msg');
        msgDiv.id = 'loading-indicator';
        msgDiv.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Thinking...';
    }
    
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll
}

// Call Gemini API
async function getGeminiResponse(prompt) {
    // Basic hardcoded fallback if API key is not provided
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve("I am a demo AI. Please insert a valid **Gemini API key** in `config.js` to get real responses.\n\nTo vote, usually you need to be registered and a citizen of the governing region.");
            }, 1000);
        });
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are VoteWise, an AI assistant focused entirely on educating users about elections, voting steps, and eligibility. Keep your answers concise, structured, and easy to read. Do not answer non-election related questions. User says: ${prompt}`
                    }]
                }]
            })
        });
        
        if (!response.ok) {
            return "API Error: Please check your API key and quota.";
        }

        const data = await response.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        }
        return "Sorry, I couldn't process that. Please try again.";
    } catch (error) {
        console.error(error);
        return "Connection error. Please check your network and API key.";
    }
}

async function handleSendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // User message
    appendMessage('user', text);
    chatInput.value = '';

    // Loading message
    appendMessage('loading', '');

    // AI Response
    const aiResponse = await getGeminiResponse(text);
    
    // Remove loading
    const loadingDoc = document.getElementById('loading-indicator');
    if (loadingDoc) loadingDoc.remove();

    // Append AI Response
    appendMessage('ai', aiResponse);

    // Intentional call to log to firestore
    logQueryToFirestore(text, aiResponse);
}

if (sendBtn) sendBtn.addEventListener('click', handleSendMessage);
if (chatInput) chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSendMessage();
});


// --- Eligibility Checker Logic ---
const checkEligBtn = document.getElementById('check-eligibility-btn');
const ageInput = document.getElementById('age-input');
const citizenInput = document.getElementById('citizen-input');
const felonyInput = document.getElementById('felony-input');
const resultBox = document.getElementById('eligibility-result');

if (checkEligBtn) {
    checkEligBtn.addEventListener('click', () => {
        const age = parseInt(ageInput.value);
        const isCitizen = citizenInput.value;
        const hasFelony = felonyInput.value;

        resultBox.classList.remove('hidden', 'eligible', 'ineligible');

        if (!ageInput.value || !isCitizen || !hasFelony) {
            resultBox.textContent = "Please fill out all fields.";
            resultBox.classList.add('ineligible');
            resultBox.classList.remove('hidden');
            return;
        }

        // Simple Logic: Over 18, Citizen = Yes, Felony = No (basic general structure)
        if (age >= 18 && isCitizen === 'yes' && hasFelony === 'no') {
            resultBox.textContent = "You appear to be ELIGIBLE to vote! Please verify with your local election office.";
            resultBox.classList.add('eligible');
        } else {
            resultBox.textContent = "You appear to be INELIGIBLE based on these general rules (e.g., Age < 18, Non-citizen, or active felony). Please check your local and state laws.";
            resultBox.classList.add('ineligible');
        }
        resultBox.classList.remove('hidden');
    });
}

// --- FAQs Logic ---
const faqQuestions = document.querySelectorAll('.faq-question');
faqQuestions.forEach(btn => {
    btn.addEventListener('click', () => {
        const parent = btn.parentElement;
        parent.classList.toggle('active');
    });
});
