// Firebase configuration snippet
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
// import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let GEMINI_API_KEY = "";
try {
    const config = await import('./config.js');
    GEMINI_API_KEY = config.GEMINI_API_KEY || "";
} catch (e) {
    console.warn("config.js not found. Chat requires GEMINI_API_KEY.");
}

document.addEventListener('DOMContentLoaded', () => {

    // --- Navigation & Routing Logic ---
    const navLinks = document.querySelectorAll('.nav-links li');
    const sections = document.querySelectorAll('.content-section');
    const sidebar = document.getElementById('sidebar');
    const openSidebarBtn = document.getElementById('open-sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const targetSection = link.getAttribute('data-section');
            sections.forEach(sec => {
                sec.classList.remove('active');
                if (sec.id === targetSection) {
                    sec.classList.add('active');
                }
            });

            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        });
    });

    if (openSidebarBtn) openSidebarBtn.addEventListener('click', () => sidebar.classList.add('open'));
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', () => sidebar.classList.remove('open'));

    // --- Interactive Checklist ---
    const taskChecks = document.querySelectorAll('.task-check');
    const statusText = document.getElementById('checklist-status');

    taskChecks.forEach(check => {
        check.addEventListener('change', () => {
            const completed = document.querySelectorAll('.task-check:checked').length;
            const total = taskChecks.length;
            statusText.textContent = `${completed}/${total} Completed`;
        });
    });

    // --- Personalized Voting Plan Generator ---
    const genPlanBtn = document.getElementById('generate-plan-btn');
    const planForm = document.getElementById('plan-form');
    const planRoadmap = document.getElementById('plan-roadmap');
    const roadmapSteps = document.getElementById('roadmap-steps');
    const resetPlanBtn = document.getElementById('reset-plan-btn');
    const ageInputPlan = document.getElementById('plan-age');
    const firstTimeInput = document.getElementById('plan-first-time');

    if (genPlanBtn) {
        genPlanBtn.addEventListener('click', () => {
            const age = parseInt(ageInputPlan.value);
            const firstTime = firstTimeInput.value;

            if (!age || !firstTime) {
                alert("Please fill out both fields.");
                return;
            }

            roadmapSteps.innerHTML = ''; // clear

            let steps = [];

            if (age < 18) {
                steps.push({ icon: 'fa-user-clock', text: `You are ${age}. Check if your state allows pre-registration for 16-17 year olds!` });
            } else {
                steps.push({ icon: 'fa-check', text: 'You meet the general age requirement (18+).' });
            }

            if (firstTime === 'yes') {
                steps.push({ icon: 'fa-id-card', text: 'As a first-time voter, thoroughly review the ID requirements in your specific jurisdiction.' });
                steps.push({ icon: 'fa-search', text: 'Locate your polling place early. It may have changed.' });
            } else {
                steps.push({ icon: 'fa-sync', text: 'Verify your voter registration status hasn\'t expired or purged.' });
            }

            steps.push({ icon: 'fa-envelope-open-text', text: 'Review a sample ballot online before election day.' });

            steps.forEach(s => {
                roadmapSteps.innerHTML += `
                    <div class="road-step">
                        <div class="road-step-icon"><i class="fas ${s.icon}"></i></div>
                        <div>${s.text}</div>
                    </div>
                `;
            });

            planForm.classList.add('hidden');
            planRoadmap.classList.remove('hidden');
        });
    }

    if (resetPlanBtn) {
        resetPlanBtn.addEventListener('click', () => {
            planRoadmap.classList.add('hidden');
            planForm.classList.remove('hidden');
        });
    }

    // --- Voting Simulation Logic ---
    const simRadios = document.querySelectorAll('input[name="candidate"]');
    const simSubmitBtn = document.getElementById('sim-submit-btn');
    const simBallot = document.getElementById('sim-ballot');
    const simConfirmation = document.getElementById('sim-confirmation');
    const simResetBtn = document.getElementById('sim-reset-btn');

    simRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            simSubmitBtn.disabled = false; // enable vote button when selection is made
        });
    });

    if (simSubmitBtn) {
        simSubmitBtn.addEventListener('click', () => {
            simBallot.classList.add('hidden');
            simConfirmation.classList.remove('hidden');
        });
    }

    if (simResetBtn) {
        simResetBtn.addEventListener('click', () => {
            simConfirmation.classList.add('hidden');
            simBallot.classList.remove('hidden');
            simSubmitBtn.disabled = true;
            simRadios.forEach(r => r.checked = false);
        });
    }


    // --- AI Chat Assistant Logic (Secondary) ---
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const chatMessages = document.getElementById('chat-messages');

    function appendMessage(sender, text) {
        if (!chatMessages) return;
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message');
        if (sender === 'user') {
            msgDiv.classList.add('user-message');
            msgDiv.textContent = text;
        } else if (sender === 'ai') {
            msgDiv.classList.add('ai-message');
            let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
            formattedText = formattedText.replace(/\* (.*?)</g, '• $1<'); // Simple list formatting
            msgDiv.innerHTML = `<strong>VoteWise AI:</strong> <br>${formattedText}`;
        } else if (sender === 'loading') {
            msgDiv.classList.add('loading-msg');
            msgDiv.id = 'loading-indicator';
            msgDiv.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Thinking...';
        }
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function getGeminiResponse(prompt) {
        if (GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE" || !GEMINI_API_KEY) {
            return new Promise(resolve => {
                setTimeout(() => resolve("Please insert a valid **Gemini API key** in `script.js`. For now, this is a mock answer!"), 1000);
            });
        }
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are an AI assistant for VoteWise. Answer concisely about elections. User says: ${prompt}`
                        }]
                    }]
                })
            });
            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || "Error processing request.";
        } catch (error) {
            return "Connection error.";
        }
    }

    async function handleSendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;
        appendMessage('user', text);
        chatInput.value = '';
        appendMessage('loading', '');
        const aiResponse = await getGeminiResponse(text);
        const loadingDoc = document.getElementById('loading-indicator');
        if (loadingDoc) loadingDoc.remove();
        appendMessage('ai', aiResponse);
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
            if (age >= 18 && isCitizen === 'yes' && hasFelony === 'no') {
                resultBox.innerHTML = "<i class='fas fa-check-circle'></i> You appear generally ELIGIBLE to vote.";
                resultBox.classList.add('eligible');
            } else {
                resultBox.innerHTML = "<i class='fas fa-times-circle'></i> You may be INELIGIBLE based on general rules.";
                resultBox.classList.add('ineligible');
            }
            resultBox.classList.remove('hidden');
        });
    }

    // --- FAQs Expandable Logic ---
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(btn => {
        btn.addEventListener('click', () => {
            const parent = btn.parentElement;
            parent.classList.toggle('active');
        });
    });

});
