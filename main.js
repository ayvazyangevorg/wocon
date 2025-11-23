// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDbAW-fkz7gQf6oaQUscCDGofbVuEV0Ccs",
  authDomain: "social-2ce34.firebaseapp.com",
  databaseURL: "https://social-2ce34-default-rtdb.firebaseio.com",
  projectId: "social-2ce34",
  storageBucket: "social-2ce34.firebasestorage.app",
  messagingSenderId: "446993418578",
  appId: "1:446993418578:web:a4fb57934076e40e4d928b",
  measurementId: "G-L8KCS0S0SV"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const db = firebase.database();

// Auth handlers
const authDiv = document.getElementById('auth');
const chatDiv = document.getElementById('chat');
const userDiv = document.getElementById('user');
let currentUser = null;

document.getElementById('anLogin').onclick = () => {
  firebase.auth().signInAnonymously();
};
document.getElementById('gmailLogin').onclick = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider);
};
document.getElementById('logout').onclick = () => {
  firebase.auth().signOut();
};

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    authDiv.style.display = 'none';
    chatDiv.style.display = '';
    userDiv.textContent = user.isAnonymous 
      ? `👤 Anonymous` 
      : `✉️ ${user.email}`;
    loadMessages();
  } else {
    currentUser = null;
    authDiv.style.display = '';
    chatDiv.style.display = 'none';
  }
});

// Chat msg handlers
const messagesDiv = document.getElementById('messages');
const msgForm = document.getElementById('msgform');
const msgInput = document.getElementById('msgInput');

msgForm.onsubmit = (e) => {
  e.preventDefault();
  if (!currentUser) return;
  let text = msgInput.value;
  if (!text.trim()) return;
  db.ref('messages').push({
    text,
    uid: currentUser.uid,
    email: currentUser.email || '',
    ts: Date.now()
  });
  msgInput.value = '';
};

function loadMessages() {
  db.ref('messages').limitToLast(50).on('value', (snap) => {
    messagesDiv.innerHTML = '';
    const ms = snap.val();
    if (!ms) return;
    Object.entries(ms).forEach(([id, msg]) => {
      const msgEl = document.createElement('div');
      msgEl.className = 'msg ' + (msg.uid === currentUser.uid ? 'own' : 'other');
      let uname = msg.email ? msg.email.split('@')[0] : 'anon';
      msgEl.innerHTML = `<b>${uname}</b>: ${escapeHtml(msg.text)}
        <span class="time">${new Date(msg.ts).toLocaleTimeString()}</span>`;
      messagesDiv.appendChild(msgEl);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

function escapeHtml(text) {
  var map = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}