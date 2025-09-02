const socket = io()
const form = document.getElementById('chat')
const chatBox = document.getElementById('chatBox')

let username = localStorage.getItem('username')
const token = localStorage.getItem('accessToken')

if (!token){
    window.location.href = '/login'
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

async function getAuth(){
    const data = await fetch('/verify', {
        method: "GET",
        headers: { 'Authorization': `Bearer ${token}`}
    })

    if (!data.ok){
        window.alert('Your session has expired, logging out')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('username')
        return window.location.href = '/login'
    }
}
setInterval(() => {
    getAuth()
}, 10000)