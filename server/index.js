const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const PORT = process.env.PORT || 8080
const path = require('path');
const cors = require('cors');
const axios = require('axios')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('./models/User')
const bcrypt = require('bcrypt')
const saltRounds = 10
const validator = require("email-validator");

require('dotenv').config()
let corsorigin = '*'
if (process.env.NODE_ENV === "production") corsorigin = "https://triviahit.games"
const io = new Server(server, {
  cors: {origin: corsorigin}
});

if (process.env.NODE_ENV !== 'production') app.use(cors());
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

mongoose.connect(process.env.MONGOURI, { useUnifiedTopology: true, useNewUrlParser: true })

const matchmakers = []
const igplayers = []
const igrooms = []
const custommatchmakers = [] //{room: "awefawelfjalwe", users: ["3234jlwfawe", "35hq4696932qah"]}

const saveElo = (user1, user2, winner) => {
  User.findById(user1.id).then(user => {
    user.elo = user1.elo
    user.gamesPlayed ++
    if (winner !== "tie" && winner.id === user.id) user.wins ++
    user.markModified('elo')
    user.markModified("gamesPlayed")
    user.markModified("wins")
    user.save()
  })
  User.findById(user2.id).then(user => {
    user.elo = user2.elo
    user.gamesPlayed ++
    if (winner !== "tie" && winner.id === user.id) user.wins ++
    user.markModified('elo')
    user.markModified("gamesPlayed")
    user.markModified("wins")
    user.save()
  })
}
app.get('/api/userinfo', (req,res) => {
  jwt.verify(req.query.token, process.env.JWTSECRET, (err, decoded) => {
    if (err) {
      if (err instanceof jwt.TokenExpiredError) {
        res.json({error: true, msg: "session has expired"})
      } else {
        if (err instanceof jwt.JsonWebTokenError) {
          res.json({error: true, msg: "please log in"})
        } else {
          res.json({error: true, msg: "an error occured"})
        }
      }
    } else {
      User.findById(decoded.id).then(user => {
        if (user) {
          const userData = {username: user.username, email: user.email, id: user.id, elo: user.elo, gamesPlayed: user.gamesPlayed, wins: user.wins}
          const token = jwt.sign(userData, process.env.JWTSECRET, {
            expiresIn: 600, //10 mins
          })
          res.json({error: false, newToken: token, user: userData}) //change
        }
      })
    }
  })
})
app.post('/api/signup', (req, res) => {
  const {username, password, email} = req.body
  if (req.body) {
    if (password.length === 0 || username.length === 0) res.send({error: true, msg:"please fill out all required fields"})
    if (password.length <= 27 && username.length <= 27) {
      if (validator.validate(email)) {
        User.findOne({email: email}).then(user => {
          if (user) res.send({error: true, msg: "user with email already exists"})
          else {
            bcrypt.genSalt(saltRounds, (err, salt) => {
              bcrypt.hash(password, salt, (err, hash) => {
                const newUser = new User({
                  username: username,
                  password: hash,
                  email: email
                })
                newUser.save().then(newUser => {
                  const userData = {username: newUser.username, email: newUser.email, id: newUser.id, elo: newUser.elo, gamesPlayed: newUser.gamesPlayed, wins: newUser.wins}
                  const token = jwt.sign(userData, process.env.JWTSECRET, {
                    expiresIn: 600, //10 mins
                  })
                  res.json({error: false, auth: true, token})
                })
                
              })
            })
          }
        })
      } else {
        res.send({error: true, msg: "invalid email"})
      }
    } else {
      res.send({error: true, msg: "username or password is too long"})
    }
  }
})
app.post('/api/login', (req,res) => {
  const {email, password} = req.body
  if (req.body) {
    User.findOne({email}).then(user => {
      if (!user) res.send({error: true, msg:"user doesn't exist"})
      else {
        bcrypt.compare(password, user.password, (err, resp) => {
          if (resp) {
            const userData = {username: user.username, email: user.email, id: user.id, elo: user.elo, gamesPlayed: user.gamesPlayed, wins: user.wins}
            const token = jwt.sign(userData, process.env.JWTSECRET, {
              expiresIn: 600, //10 mins
            })
            res.json({error: false, auth: true, token}) //change
          } else {
            res.send({error: true, msg: "incorrect password"})
          }
        })
      }
    })
  }
})

io.on('connection', (socket) => {
  //console.log('user connected '+ socket.id)
  let userData;
  socket.on('matchmake', ({token,ranked}) => {
    jwt.verify(token, process.env.JWTSECRET, (err, decoded) => {
      if (err) {
        if (err instanceof jwt.TokenExpiredError) {
          return socket.emit("expired-token")
        } else {
          if (err instanceof jwt.JsonWebTokenError) {
            return socket.emit("no-token")
          } else {
            return socket.emit("error")
          }
        }
      }
      userData = decoded
      userData.socket = socket
      User.findById(userData.id).then(user => {
        userData.elo = user.elo
      }).then(() => {
        socket.emit('user-from-token', {username: userData.username, id: userData.id, elo: userData.elo})
        if (matchmakers.findIndex(v => v.id === decoded.id) === -1) matchmakers.push(userData)
        const similarEloArr = matchmakers.filter(m => (userData.elo <= m.elo + 20) && (userData.elo >= m.elo - 20))
        if (similarEloArr.length > 1) {
          for (let i = 0; i < similarEloArr.length; i++) {
            if (i%2 === 0) {
              if (similarEloArr[i+1]) {
                const room = similarEloArr[i].id
                if (igrooms.indexOf(v=> v.room === room) === -1) {
                  console.log(igrooms)
                  similarEloArr[i].socket.emit('found-match', true) // use first users id as unique room id
                  similarEloArr[i+1].socket.emit('found-match', false)
                  similarEloArr[i].socket.join(room)
                  similarEloArr[i+1].socket.join(room)
                  igplayers.push({id: similarEloArr[i].id, room: room, username: similarEloArr[i].username, elo: similarEloArr[i].elo, points: 0})
                  igplayers.push({id: similarEloArr[i+1].id, room: room, username: similarEloArr[i+1].username, elo: similarEloArr[i+1].elo, points: 0})
                  matchmakers.splice(matchmakers.indexOf(m => similarEloArr[i].id === m.id),1)
                  matchmakers.splice(matchmakers.indexOf(m => similarEloArr[i+1].id === m.id),1)
                  igrooms.push({room, questions: [], index: 0, loadedPlayers: [], ranked})
                }
              }    
            }
          }
        }
      })
    })
  })
  socket.on('custom-matchmake', ({token,roomid}) => {
    jwt.verify(token, process.env.JWTSECRET, (err, decoded) => {
      if (err) {
        if (err instanceof jwt.TokenExpiredError) {
          return socket.emit("expired-token")
        } else {
          if (err instanceof jwt.JsonWebTokenError) {
            return socket.emit("no-token")
          } else {
            return socket.emit("error")
          }
        }
      }
      userData = decoded
      userData.socket = socket
      User.findById(userData.id).then(user => {
        userData.elo = user.elo
      }).then(() => {
        socket.emit('user-from-token', {username: userData.username, id: userData.id, elo: userData.elo})
        if (roomid) {
          const cmmfilter = custommatchmakers.filter(v => v.room === roomid)
          if (cmmfilter.length === 1) {
            if (userData.id !== cmmfilter[0].users[0].id) {
              socket.join(roomid)
              cmmfilter[0].users[0].socket.emit('game-starting', true)
              socket.emit('game-starting', false)
              igplayers.push({id: cmmfilter[0].users[0].id, room: roomid, username: cmmfilter[0].users[0].username, elo: cmmfilter[0].users[0].elo, points: 0})
              igplayers.push({id: userData.id, room: roomid, username: userData.username, elo: userData.elo, points: 0})
              custommatchmakers.splice(custommatchmakers.indexOf(v => v.room === roomid),1)
              igrooms.push({room:roomid, questions: [], index: 0, loadedPlayers: [], ranked:false})
            } else {
              socket.emit('same-person')
            }
            
          } else {
            socket.emit('no-room-found')
          }
        } else {
          custommatchmakers.push({room: socket.id, users: [userData]})
          socket.emit('custom-room-id', socket.id)
          socket.join(socket.id)
        }
      })
    })
  })
  socket.on('start-game', () => {
    let igindex = -1;
    igplayers.map((v,i) => {
      if (v.id === userData.id) igindex = i
    })
    if (igplayers[igindex]) {
      const room = igplayers[igindex].room
      const roomindex = igrooms.findIndex(v => v.room === room)
      const igfilter = igplayers.filter(p => p.room === room)
      if (igrooms[roomindex].loadedPlayers.indexOf(v => v.id === userData.id) === -1) igrooms[roomindex].loadedPlayers.push(userData.id)
      if (igrooms[roomindex].loadedPlayers.length >= 2) {
        io.to(room).emit('players', {players: igfilter, first: true})
      }
      
    }   
  })


  socket.on('get-questions', (difficulty) => {
    let igindex = -1;
    igplayers.map((v,i) => {
      if (v.id === userData.id) igindex = i
    })
    const room = igplayers[igindex].room
    const roomindex = igrooms.findIndex(v => v.room === room)
    if (!igrooms[roomindex]) return null
    axios.get(`https://opentdb.com/api.php?amount=10&difficulty=${difficulty}`)
    .then(res => {
      if (igrooms[roomindex]) igrooms[roomindex].questions = res.data.results
      setTimeout(() => {
        if (igrooms[roomindex]) {
          io.to(room).emit('category', {category: igrooms[roomindex].questions[0].category, index: 0})
        }
      }, 5000)
    })
  })
  socket.on('start-timer', (num) => {
    const igindex = igplayers.findIndex(v => v.id === userData.id)
    if (igplayers[igindex]) {
      const room = igplayers[igindex].room
      const roomindex = igrooms.findIndex(v => v.room === room)
      if (igrooms[roomindex]) {
        clearInterval(igrooms[roomindex].roomtimer)
        igrooms[roomindex].timer = num
        igrooms[roomindex].roomtimer = setInterval(() => {
          if (igrooms[roomindex]) {
            io.to(room).emit('timer', igrooms[roomindex].timer)
            if (igrooms[roomindex].timer === 0) {
              clearInterval(igrooms[roomindex].roomtimer)
              io.to(room).emit('timer-done')
            }
            igrooms[roomindex].timer --
          }
        }, 1000)
        
      }
    }
    
  })
  socket.on('stop-timer', () => {
    const igindex = igplayers.findIndex(v => v.id === userData.id)
    const room = igplayers[igindex].room
    const roomindex = igrooms.findIndex(v => v.room === room)
    clearInterval(igrooms[roomindex].roomtimer)
  })

  socket.on('buzz', () => { //call for steal aswell
    const igindex = igplayers.findIndex(v => v.id === userData.id)
    const room = igplayers[igindex].room
    const roomindex = igrooms.findIndex(v => v.room === room)
    if (igrooms[roomindex].roomtimer) {
      clearInterval(igrooms[roomindex].roomtimer)
    }
    if (!igrooms[roomindex]) return null
    if (!igrooms[roomindex].userchosen) {
      igrooms[roomindex].userchosen = true
      igrooms[roomindex].correctanswer = igrooms[roomindex].questions[igrooms[roomindex].index].correct_answer
      let answers = igrooms[roomindex].questions[igrooms[roomindex].index].incorrect_answers
      answers.push(igrooms[roomindex].correctanswer)
      answers.sort(() => Math.random() - 0.5)
      io.to(room).emit('answer-question', {id: userData.id, username: userData.username, question: igrooms[roomindex].questions[igrooms[roomindex].index].question, answers: answers})
    }  
  })

  socket.on('answer-question', (answer) => {
    const igindex = igplayers.findIndex(v => v.id === userData.id)
    const room = igplayers[igindex].room
    const roomindex = igrooms.findIndex(v => v.room === room)
    const gameFinished = () => {
      const igfilter = igplayers.filter(p => p.room === room)
      if (igfilter[0].points > igfilter[1].points) {
        igfilter[0].elo = igfilter[0].elo + 5
        igfilter[1].elo = igfilter[1].elo - 3
        if (igrooms[roomindex].ranked) saveElo(igfilter[0], igfilter[1], igfilter[0])
      }
      if (igfilter[0].points < igfilter[1].points) {
        igfilter[1].elo = igfilter[1].elo + 5
        igfilter[0].elo = igfilter[0].elo - 3
        if (igrooms[roomindex].ranked) saveElo(igfilter[0], igfilter[1], igfilter[1])
      }
      if (igfilter[0].points === igfilter[1].points) {
        if (igrooms[roomindex].ranked) saveElo(igfilter[0], igfilter[1], "tie")
      }
      io.to(room).emit('players', {players: igfilter, first: false})
      clearInterval(igrooms[roomindex].roomtimer)
      io.to(room).emit('game-finished')
      igrooms.splice(roomindex,1)
      console.log('removing room')
    }
    if (!igrooms[roomindex]) return null
    if (answer) {
      io.to(room).emit('user_answered', answer)
      if (answer === igrooms[roomindex].correctanswer) {
        igplayers[igindex].points = igplayers[igindex].points + 1
        igplayers[igindex].elo = igplayers[igindex].elo + 1
        igrooms[roomindex].index ++
        if (igrooms[roomindex]) io.to(room).emit('answer', igrooms[roomindex].correctanswer)
        if (igrooms[roomindex].index < 10) {
          const igfilter = igplayers.filter(p => p.room === room)
          io.to(room).emit('players', {players: igfilter, first: false})
          io.to(room).emit('category', {category: igrooms[roomindex].questions[igrooms[roomindex].index].category, index: igrooms[roomindex].index})
        } else {
          gameFinished()
        }
  
      } else {
        igplayers[igindex].points = igplayers[igindex].points - 1
        igplayers[igindex].elo = igplayers[igindex].elo - 1
        igrooms[roomindex].index ++
        if (igrooms[roomindex]) io.to(room).emit('answer', igrooms[roomindex].correctanswer)
        if (igrooms[roomindex].index < 10) {
          const igfilter = igplayers.filter(p => p.room === room)
          io.to(room).emit('players', {players: igfilter, first: false})
          io.to(room).emit('category', {category: igrooms[roomindex].questions[igrooms[roomindex].index].category, index: igrooms[roomindex].index})
        } else{ 
          gameFinished()
        }
        
      } 
     
    } else {
      igrooms[roomindex].index ++
      if (igrooms[roomindex].index < 10) {
        const igfilter = igplayers.filter(p => p.room === room)
        io.to(room).emit('players', {players: igfilter, first: false})
        io.to(room).emit('category', {category: igrooms[roomindex].questions[igrooms[roomindex].index].category, index: igrooms[roomindex].index})
      } else{ 
        gameFinished()
      }
    }
    
    if (igrooms[roomindex]) igrooms[roomindex].userchosen = false
  })
  socket.on('no-answer-timer', () => {
    const igindex = igplayers.findIndex(v => v.id === userData.id)
    const room = igplayers[igindex].room
    const roomindex = igrooms.findIndex(v => v.room === room)
    console.log(igplayers[igindex].username)
    igrooms[roomindex].index ++
    igplayers[igindex].points = igplayers[igindex].points - 1
    igplayers[igindex].elo = igplayers[igindex].elo - 1
    io.to(room).emit('answer', igrooms[roomindex].correctanswer)
    if (igrooms[roomindex].index < 10) {
      const igfilter = igplayers.filter(p => p.room === room)
      io.to(room).emit('players', {players: igfilter, first: false})
      io.to(room).emit('category', {category: igrooms[roomindex].questions[igrooms[roomindex].index].category, index: igrooms[roomindex].index})
    } else{ 
      const igfilter = igplayers.filter(p => p.room === room)
      if (igfilter[0].points > igfilter[1].points) {
        igfilter[0].elo = igfilter[0].elo + 5
        igfilter[1].elo = igfilter[1].elo - 3
        if (igrooms[roomindex].ranked) saveElo(igfilter[0], igfilter[1], igfilter[0])
      }
      if (igfilter[0].points < igfilter[1].points) {
        igfilter[1].elo = igfilter[1].elo + 5
        igfilter[0].elo = igfilter[0].elo - 3
        if (igrooms[roomindex].ranked) saveElo(igfilter[0], igfilter[1], igfilter[1])
      }
      if (igfilter[0].points === igfilter[1].points) {
        if (igrooms[roomindex].ranked) saveElo(igfilter[0], igfilter[1], "tie")
      }
      io.to(room).emit('players', {players: igfilter, first: false})
      clearInterval(igrooms[roomindex].roomtimer)
      io.to(room).emit('game-finished')
      igrooms.splice(roomindex,1)
      console.log('removing room')
    }
    if (igrooms[roomindex]) igrooms[roomindex].userchosen = false
  })
  socket.on('disconnect', () => {
    console.log("user disconnected " + socket.id)
    if (userData) {
      if (matchmakers.filter(m => m.id === userData.id).length > 0) matchmakers.splice(matchmakers.findIndex(m => m.id === userData.id), 1)
      if (custommatchmakers.findIndex(m => m.room === socket.id) !== -1) {
        custommatchmakers.splice(custommatchmakers.findIndex(m => m.room === socket.id),1)
      }
      let igindex = -1;
      igplayers.map((v,i) => {
        if (v.id === userData.id) igindex = i
      })
      if (igindex !== -1) {   
        const room = igplayers[igindex].room
        const roomindex = igrooms.findIndex(v => v.room === room)
        if (roomindex !== -1 && igrooms[roomindex].gameFinished !== true) {
          io.to(room).emit('game-cancelled')
          clearInterval(igrooms[roomindex].roomtimer)
          const igfilter = igplayers.filter(p => p.room === room)
          igfilter.forEach(f => igplayers.splice(igplayers.findIndex(e => e.id === f.id),1))
          igrooms.splice(roomindex,1)
        } else {
          igplayers.splice(igindex,1)
        }
      }
    }
  })

})

if (process.env.NODE_ENV === 'production') {

  app.use(express.static('../client/build'))
  app.get('*', (req,res) => {
    res.sendFile(path.resolve('../client', 'build', 'index.html'))
  })
}

server.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});