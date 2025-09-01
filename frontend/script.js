const socket = io('http://localhost:3000')
const form = document.getElementById('chat')
const chatBox = document.getElementById('chatBox')

let username = localStorage.getItem('username')
const token = localStorage.getItem('accessToken')

if (!token){
    window.location.href = 'http://localhost:3000/login'
}

socket.on('chat-message', data => {
    sendChat(data)
})

form.addEventListener('submit', (e) => {
    e.preventDefault()
    const message = document.getElementById('message')
    const element = document.createElement('p')
    const msg = message.value
    element.textContent = `${username}: ${message.value}`
    socket.emit('send-message', { username, msg })
    chatBox.appendChild(element)
    message.value = ''
})

function sendChat(message){
    const element = document.createElement('p')
    element.textContent = `${message.username}: ${message.msg}`
    chatBox.appendChild(element)
}

async function loggedIn(){
    const res = await fetch('http://localhost:3000/chat', {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}`}
    })

    if (!res.ok) return window.location.href = 'login.html'
}
loggedIn()