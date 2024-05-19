import { Server } from 'socket.io';
import * as http from 'http';


let io: Server;

export function initSocket(server: http.Server) {
  io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  return io;
}
export function getIo() {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}

