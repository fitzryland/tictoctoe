const express  = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const socket = require('socket.io')
const cors = require('cors')
const keys = require('./config/keys')
const GameSession = require('./model/gameSession')
const Game = require('./model/game')
const User = require('./model/user')

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
  registerUser: async (userId, socketId) => {
    db.collections.users.updateOne(
      { userId: userId },
      {
        $set: {
          userId: userId,
          socketId: socketId
        }
      },
      { upsert: true }
    )
  },
  createGame: async (userId) => {
    let gameState = await ticTac.getNewState()
    gameState = ticTac.addUserToGame(userId, gameState)
    let gameId = Math.floor(Math.random() * 10000)
    let gameData = {
      name: 'Tic Tac Toe',
      state: gameState,
      id: gameId
    }
    let newSession = await new GameSession(gameData).save().then((entry) => {
      ticTac.sendTo(gameId, 'newGame', entry)
    })
  },
  joinGame: async (gameId, userId) => {
    let curState = await ticTac.updateState(gameId, (gameState) => {
      gameState = ticTac.addUserToGame(userId, gameState)
      return gameState
    })
    ticTac.sendTo(gameId, 'updateGame', curState)
  },
  addUserToGame: (userId, gameState) => {
    let user = {
      id: userId,
      isTurn: false,
      team: false,
      isObserver: true
    }
    let existingUser = gameState.users.find( el => el['id'] === userId )
    let usersLength = gameState.users.length
    // if no other players
    if ( usersLength === 0 ) {
      // add player X and is turn = true
      user.isTurn = true
      user.team = 'X'
      user.isObserver = false
    } else if ( usersLength < 2 ) {
      // join the game
      user.team = 'O'
      user.isObserver = false
    } else {}
    // if the user isn't already part of the game
    if ( ! existingUser ) {
      gameState.users.push(user)
    }
    return gameState
  },
  getNewState: async () => {
    let game = await Game.findOne({ name: "tic-tac-toe" })
    return game.state
  },
  getState: async (gameId) => {
    let that = this
    let game = await GameSession.findOne({ id: gameId })
    if ( game == null ) {
      game = { status: false }
    } else {
      game.status = true
    }
    return game
  },
  setState: async (gameId, gameState) => {
    await GameSession.updateOne({ id: gameId }, { $set: { state: gameState } })
    ticTac.sendTo(gameId, 'setBoxes', gameState.boxes)
  },
  updateState: async (gameId, callback) => {
    let game = await ticTac.getState(gameId)
    let newState = callback(game.state)
    ticTac.setState(gameId, newState)
    return newState
  },
  sendTo: async (gameId, command, data) => {
    let game = await ticTac.getState(gameId)
    await game.state.users.forEach(async (user, key) => {
      let userEntry = await User.findOne(
        { userId: user.id }
      )
      if ( userEntry ) {
        io.to(userEntry.socketId).emit(command, data);
      }
    })
  }
}

io.on("connection", function(socket){
  console.log("Socket Connection Established with ID :"+ socket.id)
  socket.on('createGameSession', async function(userId) {
    ticTac.createGame(userId)
  })
  socket.on('registerUser', async (userId) => {
    ticTac.registerUser(userId, socket.id)
  })
  socket.on('joinGameSession', async (gameId, userId) => {
    ticTac.joinGame(gameId, userId)
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
  socket.on("resetGame", async function(gameId) {
    ticTac.updateState(gameId, (gameState) => {
      gameState.boxes.forEach((item, key) => {
        gameState.boxes[key].checked = false
      })
      return gameState
    })
  })
  socket.on('leaveGame', async (gameId, userId) => {
    ticTac.updateState(gameId, (gameState) => {
      gameState.users = gameState.users.filter(user => user !== userId )
      return gameState
    })
  })
})