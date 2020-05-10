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
  winningSets: [
    ['a1', 'a2', 'a3'],
    ['b1', 'b2', 'b3'],
    ['c1', 'c2', 'c3'],
    ['a1', 'b1', 'c1'],
    ['a2', 'b2', 'c2'],
    ['a3', 'b3', 'c3'],
    ['a1', 'b2', 'c3'],
    ['a3', 'b2', 'c1'],
  ],
  setWinning: (gameState) => {
    let score = {}
    let boxCount = 0
    gameState.boxes.forEach((box, key) => {
      if ( box.checked ) {
        boxCount++
        if ( box.checked in score ) {
          score[box.checked].push(box.id)
        } else {
          score[box.checked] = [ box.id ]
        }
      }
    })
    Object.keys(score).forEach((userMark) => {
      let userScore = score[userMark]
      ticTac.winningSets.forEach((set, setKey) => {
        let overlap = set.filter( setBox => userScore.includes(setBox) )
        if ( overlap.length >= 3 ) {
          gameState.winner = userMark
        }
      })
    })
    if (
      gameState.winner === 'in-play'
      &&
      boxCount >= 9
    ) {
      gameState.winner = 'tie'
    }
    return gameState
  },
  clickBox: async (clickData) => {
    // clickData: {
    //   gameId: '',
    //   box: '',
    //   userId: ''
    // }
    let game = await GameSession.findOne({ id: clickData.gameId })
    let curUserStatus = game.state.users.filter(el => el.id === clickData.userId)
    if ( curUserStatus[0].isTurn ) {
      ticTac.updateState(clickData.gameId, (gameState) => {
        let i = gameState.boxes.findIndex((el) => {
          if ( el.id == clickData.box) return true
        })
        gameState.boxes[i].checked = curUserStatus[0].team
        gameState = ticTac.setWinning(gameState)
        // change who's turn it is
        gameState.users.forEach((user, key) => {
          if ( ! user.isObserver ) {
            gameState.users[key].isTurn = ! gameState.users[key].isTurn
          }
        })
        return gameState
      })
    } else {
      // @TODO issue a notice that it is not their turn
    }
  },
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
      ticTac.sendTo(gameId, entry)
    })
  },
  joinGame: async (gameId, userId) => {
    let curState = await ticTac.updateState(gameId, (gameState) => {
      gameState = ticTac.addUserToGame(userId, gameState)
      return gameState
    })
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
    await GameSession.updateOne({ id: gameId }, { $set: { state: gameState } }).then( async (entry) => {
      let curGame = await GameSession.findOne({ id: gameId })
      ticTac.sendTo(gameId, curGame)
    })
  },
  updateState: async (gameId, callback) => {
    let game = await ticTac.getState(gameId)
    let newState = callback(game.state)
    ticTac.setState(gameId, newState)
    return newState
  },
  sendTo: async (gameId, data) => {
    let game = await ticTac.getState(gameId)
    let clientGame = {
      id: game.id,
      boxes: game.state.boxes,
      name: game.name,
      isTurn: false,
      team: false,
      isObserver: true,
      winner: game.state.winner,
      usersLength: game.state.users.length
    }
    await game.state.users.forEach(async (user, key) => {
      let userEntry = await User.findOne(
        { userId: user.id }
      )
      if ( userEntry ) {
        let curUserStatus = game.state.users.filter(el => el.id === user.id)
        clientGame.isTurn = curUserStatus[0].isTurn
        clientGame.team = curUserStatus[0].team
        clientGame.isObserver = curUserStatus[0].isObserver
        // @TODO either this isn't emitting or it isn't being
        // received on the other end....
        io.to(userEntry.socketId).emit('updateGame', clientGame)
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
  socket.on("clickBox", async function(clickData) {
    ticTac.clickBox(clickData)
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