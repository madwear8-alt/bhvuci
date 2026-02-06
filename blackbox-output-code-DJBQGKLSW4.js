// Firebase imports (already in HTML)
const auth = window.firebaseAuth;
const db = window.firebaseDb;
const rtdb = window.firebaseRtdb;
const provider = window.provider;

// Your Gmail ID (owner)
const OWNER_EMAIL = 'madwera8@gmail.com'; // Replace with your Gmail

// Auth button
const authButton = document.getElementById('auth-button');
authButton.addEventListener('click', () => {
    if (auth.currentUser) {
        signOut(auth);
    } else {
        signInWithPopup(auth, provider);
    }
});

// Auth state listener
onAuthStateChanged(auth, (user) => {
    if (user && user.email === OWNER_EMAIL) {
        authButton.textContent = 'Logout';
        document.getElementById('dashboard').style.display = 'block';
        loadRequests();
        loadChat();
    } else {
        authButton.textContent = 'Sign Up/Login';
        document.getElementById('dashboard').style.display = 'none';
    }
});

// Contact form submission
document.getElementById('contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    await addDoc(collection(db, 'requests'), { name, email, message, timestamp: new Date() });
    alert('Message sent!');
    e.target.reset();
});

// Load requests for owner
async function loadRequests() {
    const requestsList = document.getElementById('requests-list');
    requestsList.innerHTML = '';
    const querySnapshot = await getDocs(collection(db, 'requests'));
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const div = document.createElement('div');
        div.className = 'request';
        div.innerHTML = `<strong>${data.name} (${data.email}):</strong> ${data.message}`;
        requestsList.appendChild(div);
    });
}

// Chat functionality
let currentChatUser = null; // For simplicity, assume chatting with the last request user

function loadChat() {
    const chatMessages = document.getElementById('chat-messages');
    const chatRef = ref(rtdb, 'chats/' + (currentChatUser || 'general'));
    onValue(chatRef, (snapshot) => {
        chatMessages.innerHTML = '';
        snapshot.forEach((childSnapshot) => {
            const message = childSnapshot.val();
            const div = document.createElement('div');
            div.className = `message ${message.sender === OWNER_EMAIL ? 'owner' : 'user'}`;
            div.textContent = message.text;
            chatMessages.appendChild(div);
        });
    });
}

document.getElementById('send-chat').addEventListener('click', () => {
    const input = document.getElementById('chat-input');
    const message = input.value;
    if (message) {
        push(ref(rtdb, 'chats/' + (currentChatUser || 'general')), {
            sender: OWNER_EMAIL,
            text: message,
            timestamp: Date.now()
        });
        input.value = '';
    }
});

// Smooth scrolling (unchanged)
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});