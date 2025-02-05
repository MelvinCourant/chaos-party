/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

/*import { Server } from 'socket.io'
import {randomUUID} from "node:crypto";

const io = new Server(
  3000,
  {
    cors: {
      origin: '*',
    },
  }
)

let players: any[] = [];

io.on('connection', (socket) => {
  console.log('a user connected')
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })

  socket.on('new-join', (pseudo) => {
    socket.join('test')

    const player = {
      id: randomUUID(),
      pseudo: pseudo,
      position: {
        x: 0,
        y: 0,
      }
    };

    players.push(player);
    io.emit('new-player', player);
    io.emit('players', players);
  })

  socket.on('join', (playerID) => {
    socket.join('test')

    const player = players.find(player => player.id === playerID);
    io.emit('rejoined-player', player);
    io.emit('players', players);
  })

  socket.on('move', (playerMoving) => {
    let player = players.find(p => p.id === playerMoving.id);
    player.position = playerMoving.position;
    io.emit('moved-player', player);
  })
})*/
