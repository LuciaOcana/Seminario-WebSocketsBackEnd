import { Server } from 'socket.io';

// Creamos un conjunto de usuarios conectados
const connectedUsers = new Set();

const socketService = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Connected successfully', socket.id);
    socket.join('some room'); // El socket se une a una sala llamada 'some room'
    connectedUsers.add(socket.id);

    // Emitir el número de usuarios conectados en la sala
    io.to('some room').emit('connected-user', connectedUsers.size);

    // Evento de desconexión
    socket.on('disconnect', () => {
      console.log('Disconnected successfully', socket.id);
      connectedUsers.delete(socket.id); // Eliminar usuario de la lista de conectados
      io.to('some room').emit('connected-user', connectedUsers.size); // Actualizar el número de usuarios conectados
    });

    // Evento de desconexión manual
    socket.on('manual-disconnect', () => {
      console.log('Manual disconnect requested', socket.id);
      socket.disconnect(); // Desconectar el socket manualmente
    });

    // Evento para recibir un mensaje y enviarlo a otros usuarios
    socket.on('message', async (data: { message: string; date: Date; user: string }) => {
      // Aquí 'data' es un objeto JSON con message, date y user
      console.log(data);
    
      // Emitimos el objeto JSON a todos los clientes conectados en la "sala"
      socket.broadcast.to('some room').emit('message-receive', data);
    });

    // Evento 'sendMessage' que guarda y emite el mensaje
    socket.on('sendMessage', async (data: any) => {
      if (!data.message || !data.user || !data.date) {
        console.log('Mensaje inválido:', data);
        return; // No procesar el mensaje si falta algún campo importante
      }
    
      console.log('Mensaje recibido:', data);
    
      // Emitir el mensaje a todos los clientes conectados
      socket.broadcast.to('some room').emit('message-receive', data);
    });
  });
};

export default socketService;
