const express  = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const socket = require('socket.io')
const cors = require('cors')
const keys = require('./config/keys')
const GameSession = require('./model/gameSession')
const Game = require('./model/game')

const app = new express()
app.use(bodyParser.json())
app.use(cors())

var server = app.listen(5000,()=>{
  console.log("Howdy, I am running at PORT 5000")
})

// Connecting Mongo DB

mongoose.connect(keys.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})
let db = mongoose.connection
db.on('error',()=>{
  console.log("Error in database connection")
})
db.once('open',function(){
  console.log("DB connection established")
})

// Setting up Socket.io
let io =  socket(server);
let ticTac = {
  filter: { name: "tic-tac-toe" },
  createGame: async () => {
    let gameState = await ticTac.getNewState()
    let gameId = Math.floor(Math.random() * 10000)
    let newSession = await new GameSession({
      name: 'Tic Tac Toe',
      state: gameState,
      id: gameId
    }).save()
    io.emit("newGame", newSession)
  },
  getNewState: async () => {
    let game = await db.collections.games.findOne(ticTac.filter)
    return game.state
  },
  getState: async (gameId) => {
    let that = this
    let game = await db.collections.gamesessions.findOne({ id: gameId })
    return game.state
  },
  setState: async (gameId, gameState) => {
    await db.collections.gamesessions.updateOne({ id: gameId }, { $set: { state: gameState } })
    io.emit("setBoxes", gameState.boxes)
  },
  updateState: async (gameId, callback) => {
    let gameState = await ticTac.getState(gameId)
    let newState = callback(gameState)
    ticTac.setState(gameId, newState)
  }
}

io.on("connection", function(socket){
  console.log("Socket Connection Established with ID :"+ socket.id)
  socket.on('createGameSession', async function() {
    console.log('createGameSession')
    ticTac.createGame()
  })
  socket.on("clickBox", async function(chat) {
    ticTac.updateState(chat.gameId, (gameState) => {
      let i = gameState.boxes.findIndex((el) => {
        if ( el.id == chat.box) return true
      })
      gameState.boxes[i].checked = true
      return gameState
    })
  })
  socket.on("resetGame", async function() {
    ticTac.updateState((gameState) => {
      gameState.boxes.forEach((item, key) => {
        gameState.boxes[key].checked = false
      })
      return gameState
    })
  })
})

app.get('/set', async (req,res) => {
  db.collections.games.findOne({ name: "tic-tac-toe" }, (err, game) => {
    res.send(game.state.boxes)
  });
})