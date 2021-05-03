const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const PORT = process.env.PORT || 8080
const io = new Server(server, {
  cors: {origin: "*"}
});

const users = []
const rooms = []


io.on('connection', (socket) => {
  console.log('user connected')

  socket.on('join room', ({username, roomid}) => {
    //implement socket ids
    const user = {'userid': socket.id, username, 'roomid': roomid.toString(), 'owner': false, 'points': 0, 'finished': false, 'ingame': false}
    const room = {roomid, 'qIndex': 0, 'ingame': false, 'timerOn': false, 'allFinished': false, 'timer': null, 'startTimer': function () {
      let secs = 20
      this.timer = setInterval(() => {
        io.to(this.roomid).emit('timer-change', secs)
        secs --
        if (secs === 0) {
          io.to(this.roomid).emit('timer-finished')
          clearInterval(this.timer)
        }
      }, 1000)
    }, 'stopTimer': function () { 
      clearInterval(this.timer)
    }}

    socket.join(user.roomid)
    
    if (rooms.findIndex(newRoom => newRoom.roomid === user.roomid) === -1) {
      rooms.push(room)
      user.owner = true
      users.push(user)
    } else {
      user.owner = false
      users.push(user)
      if (rooms[rooms.findIndex(newRoom => newRoom.roomid === user.roomid)].ingame === true) {
        socket.emit('ingame', true)
      }
    }
    
    socket.emit('get-this-user', user)

    io.to(user.roomid).emit('roomUsers', {
      roomid: user.roomid,
      users: users.filter(newUser => newUser.roomid === user.roomid)
    })

    const roomindex = rooms.findIndex(newRoom => newRoom.roomid === user.roomid)

    socket.on('start-game', (questions) => {
      io.to(user.roomid).emit('start-game', questions)
      const usersInRoom = users.filter(newUser => newUser.roomid === user.roomid)
      io.to(user.roomid).emit('get-users-data', usersInRoom)
      console.log(user.username + " started game!")
      rooms[roomindex].startTimer()
      rooms[roomindex].ingame = true
    })

    socket.on('user-finished', ({correct}) => {
      const rindex = rooms.findIndex(newRoom => newRoom.roomid === user.roomid)
      const index = users.findIndex(newUser => newUser.userid === user.userid)

      if (index !== -1) {
        if (correct) {
          users[index].points ++
        }
        socket.emit('score-change', users[index].points)
        users[index].finished = true
      }
      const usersInRoom = users.filter(newUser => newUser.roomid === user.roomid)
      rooms[rindex].allFinished = true
      usersInRoom.map(v => {
        if (v.finished === false) {
          rooms[rindex].allFinished = false
        }
      })
      if (rooms[rindex].allFinished) {
        //const rindex = rooms.findIndex(newRoom => newRoom.roomid === room.roomid)
        if (rindex !== -1) {
          rooms[rindex].qIndex ++
        }
        io.to(room.roomid).emit('all-users-finished-question', rooms[rindex].qIndex)
        rooms[rindex].stopTimer()
        rooms[rindex].startTimer()
        usersInRoom.map(v => v.finished = false)
      }
      io.to(user.roomid).emit('get-users-data', usersInRoom)
      console.log(`${user.username} finished and was ${correct ? 'correct' : 'incorrect'}`)

      if (rooms[rindex].qIndex === 10) {
        
        if (rindex !== -1) {
          console.log(rooms)
          console.log('ROOM '+ rooms[rindex].roomid + ' FINISHED')
          rooms[rindex].stopTimer()
          rooms.splice(rindex,1)
        }
        console.log(rooms)
        socket.emit('ingame', false)
      }
    })

    socket.on('disconnect', () => {
      if (user) {
        const index = users.findIndex(newUser => newUser.userid === user.userid)
        if (index !== -1) {
          users.splice(index,1)
        }
        console.log(`${user.username} disconnected`)
        io.to(user.roomid).emit('roomUsers', {
          roomid: user.roomid,
          users: users.filter(newUser => newUser.roomid === user.roomid)
        })
        io.to(user.roomid).emit('get-users-data', users.filter(newUser => newUser.roomid === user.roomid))
        if (rooms[roomindex]) {
          if (users.filter(nUser => nUser.roomid === rooms[roomindex].roomid).length === 0) {
            rooms.splice(roomindex,1)
            console.log('everyone left, removing room.')
          }
        }
      }
    })
  })
  
})



// if (process.env.NODE_ENV === 'production') {

//   app.use(express.static('../client/build'))
//   app.get('*', (req,res) => {
    
//     res.sendFile(path.resolve('/client', 'build', 'index.html'))
//   })
// }

server.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});