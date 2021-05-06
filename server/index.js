const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const PORT = process.env.PORT || 8080
const path = require('path');
const cors = require('cors');

const io = new Server(server, {
  cors: {origin: "*"}
});
if (process.env.NODE_ENV !== 'production') app.use(cors());

const users = []
const rooms = []
const maxLifespan = 30000
// check once per second
setInterval(function checkItems(){
  rooms.map(function(item,index){
    if(Date.now() - maxLifespan > item.createdAt && users.filter(u => u.roomid === item.roomid).length === 0){
      console.log(`removing ${item.roomid}`)
      rooms.splice(index, 1) // remove first item
    }
  })
}, 1000)
io.on('connection', (socket) => {
  console.log('user connected')
  socket.on('in-room', (roomid) => {
    if (rooms.findIndex(newRoom => newRoom.roomid === roomid) === -1) {
      socket.emit('no-room')
    }
    socket.on('disconnect', () => {
      const index = rooms.findIndex(r => r.roomid === roomid.toString())
      if (index !== -1) {
        if (users.filter(u => u.roomid === roomid.toString()).length === 0) {
          rooms.splice(index, 1)
          console.log(rooms)
        }
      }
      
    })
  })
  socket.on('join room', ({username, roomid}) => {
    const user = {'userid': socket.id, username, 'roomid': roomid.toString(), 'owner': false, 'points': 0, 'finished': false, 'ingame': false}
    
    if (rooms.findIndex(newRoom => newRoom.roomid === roomid.toString()) === -1) {
      socket.emit('no-room')
    } else {
      
      socket.join(user.roomid)
      if (users.findIndex(u => u.roomid === user.roomid) === -1) {
        user.owner = true
        users.push(user)
      } else {
        user.owner = false
        users.push(user)
      }
      if (rooms[rooms.findIndex(newRoom => newRoom.roomid === user.roomid)].ingame === true) {
        socket.emit('ingame', true)
      }
    }

    socket.on('get-single-user', () => socket.emit('get-this-user', user))
    

    io.to(user.roomid).emit('roomUsers', {
      roomid: user.roomid,
      users: users.filter(newUser => newUser.roomid === user.roomid)
    })


    socket.on('start-game', (questions) => {
      const rindex = rooms.findIndex(newRoom => newRoom.roomid === user.roomid)
      io.to(user.roomid).emit('start-game', questions)
      const usersInRoom = users.filter(newUser => newUser.roomid === user.roomid)
      io.to(user.roomid).emit('get-users-data', usersInRoom)
      console.log(user.username + " started game!")
      rooms[rindex].startTimer()
      rooms[rindex].ingame = true
      usersInRoom.map(u => {u.ingame = true; console.log(u)})
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
      const usersInRoom = users.filter(newUser => newUser.roomid === user.roomid && newUser.ingame === true)
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
        io.to(rooms[rindex].roomid).emit('all-users-finished-question', rooms[rindex].qIndex)
        rooms[rindex].stopTimer()
        rooms[rindex].startTimer()
        usersInRoom.map(v => {
          v.finished = false 
        })
      }
      io.to(user.roomid).emit('get-users-data', usersInRoom)
      console.log(`${user.username} finished and was ${correct ? 'correct' : 'incorrect'}`)

      if (rooms[rindex].qIndex === 10) {
        
        if (rindex !== -1) {
          console.log(rooms)
          console.log('ROOM '+ rooms[rindex].roomid + ' FINISHED')
          rooms[rindex].stopTimer()
          rooms[rindex].qIndex = 0
          rooms[rindex].ingame = false
          rooms[rindex].allFinished = false
          rooms[rindex].timerOn = false
          usersInRoom.map(v => {
            v.ingame= false
            v.points = 0
          })
        }
        console.log(rooms)
        socket.emit('ingame', false)
      }
    })
    socket.on('get-users', () => {
      io.to(user.roomid).emit('roomUsers', {
        roomid: user.roomid,
        users: users.filter(newUser => newUser.roomid === user.roomid)
      })
    })
    // socket.on('to-lobby', () => {

    // })
    socket.on('disconnect', () => {
      const rindex = rooms.findIndex(newRoom => newRoom.roomid === user.roomid)
      //add remove room on owner leave
      if (user) {
        const index = users.findIndex(newUser => newUser.userid === user.userid)
        
        if (index !== -1) {
          users.splice(index,1)
          if (user.owner == true) {
            otherusers = users.filter(newUser => newUser.roomid === user.roomid)
            if (otherusers.length > 0) {
              otherusers[0].owner = true
              console.log(users)
              socket.emit('get-this-user', user)
            }
            
          }
        }
        console.log(`${user.username} disconnected`)
        io.to(user.roomid).emit('roomUsers', {
          roomid: user.roomid,
          users: users.filter(newUser => newUser.roomid === user.roomid)
        })
        io.to(user.roomid).emit('get-users-data', users.filter(newUser => newUser.roomid === user.roomid))
        if (rooms[rindex]) {
          if (users.filter(nUser => nUser.roomid === rooms[rindex].roomid).length === 0) {
            rooms.splice(rindex,1)
            console.log('everyone left, removing room.')
          }
        }
      }
    })
  })
  
})


app.get('/status', (req,res) => {
  res.json({'status': '200'})
})

app.get('/api/get-room', (req,res) => {
  console.log('get room req')
  let val = Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);
  const room = {'createdAt': Date.now(), 'roomid': null, 'qIndex': 0, 'ingame': false, 'timerOn': false, 'allFinished': false, 'timer': null, 'startTimer': function () {
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
  if (rooms.filter(room => room.roomid === val).length === 0) {
    room.roomid = val
    rooms.push(room)
    res.json({'room': val})
  } else {
    console.log('same')
  }  
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