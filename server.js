import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import db from './schema.js'
import { hashPass, checkHash } from './auth.js'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()
const app = express()
const sockServer = createServer(app)
const io = new Server(sockServer, { cors: { origin: '*' }})
app.use(cors())
app.use(express.json())

const __path = fileURLToPath(import.meta.url)
const __dir = path.dirname(__path)
app.use(express.static(path.join(__dir, 'frontend')))

io.on('connection', socket => {
    socket.on('send-message', msg => {
        socket.broadcast.emit('chat-message', msg)
    })
})

app.post('/register', async (req, res) => {
    const { username, password } = req.body

    if (!username || !password ) return res.sendStatus(401);

    const hash = await hashPass(password)

    const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)')
    stmt.run(username, hash)
    res.status(200).send('Success!')
})

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dir, 'frontend', 'login.html'))
})

app.get('/verify', authenticate, (req, res) => {
    res.sendStatus(205)
})

app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dir, 'frontend', 'chat.html'))
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dir, 'frontend', 'register.html'))
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body

    if (!username || !password ) return res.sendStatus(401);

    const userRecord = db.prepare('SELECT * FROM users WHERE username = ?').get(username)
    
    const hash = await checkHash(password, userRecord.password)

    if (!hash) return res.sendStatus(403)
    
    const user = { name: username }
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '10m' })
    res.status(200).json({ accessToken: accessToken, username: username })
})

sockServer.listen(3000, () => {
    console.log('Running on localhost:3000')
})

function authenticate(req, res, next){
    const authHeader = req.headers['authorization']
    
    if (!authHeader) return res.sendStatus(401);

    const token = authHeader.split(' ')[1]

    if (!token) return res.sendStatus(403);

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user
        next()
    })
}