const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");
const newSessionButton = document.querySelector("#new-session-btn");
const showHistoryButton = document.querySelector("#show-history-btn");
let sessionHistory = [];

let userText = null;
const API_KEY="paste_api_key";
const initialHeight = chatInput.scrollHeight;


const loadDataFromLocalStorage = () =>{
    const themeColor = localStorage.getItem("theme-color");
    document.body.classList.toggle("light-mode",themeColor === "light_mode");
    localStorage.setItem("theme-color",themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    const defaultText = `<div class="default-text">
                            <h1> CHAT UI CLONE</h1>
                            <br>let us start the conversation.<br>Your chat history will be display here...</p>
                        </div>`

    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
    chatContainer.scrollTo(0,chatContainer.scrollHeight);
}
loadDataFromLocalStorage();

const createElement = (html,className) => {
    const chatDiv = document.createElement('div');
    chatDiv.classList.add("chat",className);
    chatDiv.innerHTML = html;
    return chatDiv;
}

const getChatResponse = async (incomingChatDiv) =>{
    const API_URL = "https://api.openai.com/v1/completions";
    const pElement = document.createElement("p");

    const requestOptions ={
        method : "POST",
        headers:{
            "Content-Type":"application/json",
            "Authorization":`Bearer ${API_KEY}`,
        },
        body : JSON.stringify({
            // model: "gpt-3.5-turbo",
            // messages: [{role: "user", content: `${userText}`}], /* Changed */
            // // prompt : userText,
            // max_tokens: 2048,
            // temperature: 0.2,
            // n: 1,
            // stop: null
            model: "gpt-3.5-turbo-instruct",
            prompt: userText,
            max_tokens: 3000,
            temperature: 0,
            n: 1,
            stop: null,
        })
    }
    try {
        const response = await(await fetch(API_URL,requestOptions)).json();
        pElement.textContent = response.choices[0].text.trim();
    } catch (error) {
        pElement.classList.add("error");
        pElement.textContent = "oops! something went wrong please try after some time.";
    }
    incomingChatDiv.querySelector('.typing-animation').remove();
    incomingChatDiv.querySelector('.chat-details').appendChild(pElement);
    chatContainer.scrollTo(0,chatContainer.scrollHeight);
    localStorage.setItem("all-chats",chatContainer.innerHTML);
}

const copyResponse = (copyBtn) => {
    const responseTextElement = copyBtn.parentElement.querySelector('p');
    navigator.clipboard.write(responseTextElement.textContent);
    copyBtn.textContent = 'done';
    setTimeout(()=>copyBtn.textContent='content_copy',1000);
}

const showTypingAnimation = ()=>{
    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="images/chatbot.jpg" alt="chat-image">
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                    </div> 
                        <span onClick="copyResponse(this)" class="material-symbols-outlined">content_copy</i></span>
                </div>`
    const incomingChatDiv = createElement(html,"incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0,chatContainer.scrollHeight);
    getChatResponse(incomingChatDiv);
    // setTimeout(async () => {
    //     await getChatResponse(incomingChatDiv);
    // }, 1000);
    // setTimeout(getChatResponse(),2000);
}

const handleOutgoingChat = () =>{
    userText = chatInput.value.trim();
    if(!userText) return;
    // console.log(userText);

    chatInput.value = "";
    chatInput.style.height = `${initialHeight}px`;
    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="images/user.jpg" width="89" height="89" alt="user-image">
                        <p>${userText}</p>
                    </div>
                </div>`;
    const outgoingChatDiv = createElement(html,"outgoing");
    outgoingChatDiv.querySelector("p").textContent = userText;
    document.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0,chatContainer.scrollHeight);
    setTimeout(showTypingAnimation(),500);
    // showTypingAnimation();
}

themeButton.addEventListener("click",()=>{
    document.body.classList.toggle("light-mode");
    localStorage.setItem("theme-color",themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
})

deleteButton.addEventListener("click",()=>{
    if(confirm("Are you sure you want to delete your all chats ? ")){
        localStorage.removeItem("all-chats");
        loadDataFromLocalStorage();
    }
});


chatInput.addEventListener("input",()=>{
    chatInput.style.height = `${initialHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});
chatInput.addEventListener("keydown",(e)=>{
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800){
        e.preventDefault();
        handleOutgoingChat();
    }
});
sendButton.addEventListener("click",handleOutgoingChat);



// const newSession = () => {
//     if (confirm("Are you sure you want to start a new session?")) {
//         localStorage.removeItem("all-chats");
//         sessionHistory = []; // Clear the session history array
//         loadDataFromLocalStorage();
//     }
// };

// newSessionButton.addEventListener("click", newSession);

const newSession = () => {
    if (confirm("Are you sure you want to start a new session?")) {
        const currentSession = localStorage.getItem("all-chats");
        sessionHistory.push(currentSession); // Save current session to history
        localStorage.removeItem("all-chats");
        loadDataFromLocalStorage();
    }
};
newSessionButton.addEventListener("click", newSession);

// const loadSession = (index) => {
//     if (sessionHistory.length > index) {
//         localStorage.setItem("all-chats", sessionHistory[index]);
//         loadDataFromLocalStorage();
//     }
// }

// showHistoryButton.addEventListener("click", loadSession);



const showSessionHistoryModal = () => {
    const modal = document.createElement("div");
    modal.classList.add("session-history-modal");
    modal.innerHTML = "<h2>Session History</h2>";

    sessionHistory.forEach((session, index) => {
        const sessionItem = document.createElement("div");

        
        // Assuming session is a string representing the session content
        const sessionContent = session.replace(/<\/?[^>]+(>|$)/g, ""); // Remove HTML tags for simplicity
        const sessionSummary = sessionContent.length > 30 ? sessionContent.substring(0, 30) + "..." : sessionContent;
        
        // sessionItem.textContent = `Session ${index + 1}`;
        sessionItem.innerHTML = `<span>Session ${index + 1}</span><p>${sessionSummary}</p>`;

        sessionItem.addEventListener("click", () => {
            loadSession(index);
            modal.remove();
        });

        modal.appendChild(sessionItem);
    });
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.remove();
            // Load the current session if it exists
            loadSession(sessionHistory.length - 1);
        }
    });

    document.body.appendChild(modal);
};


const loadSession = (index) => {
    if (sessionHistory.length > index) {
        localStorage.setItem("all-chats", sessionHistory[index]);
        loadDataFromLocalStorage();
    }
};

// Update the event listener for showHistoryButton
showHistoryButton.addEventListener("click", showSessionHistoryModal);