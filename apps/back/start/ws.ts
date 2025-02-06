import app from '@adonisjs/core/services/app'
import Ws from '#services/Ws'

app.ready(() => {
  Ws.boot()
  const io = Ws.io

  io?.on('connection', (socket) => {
    console.log(`Connexion : ${socket.id}`)

    Ws.sockets.set(socket.id, socket)

    socket.on('disconnect', () => {
      console.log(`Déconnexion : ${socket.id}`)
      Ws.sockets.delete(socket.id)
    })
  })
})
