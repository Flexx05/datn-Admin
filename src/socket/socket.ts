import { io } from "socket.io-client";

const API_SOCKET_URL = "http://localhost:8080";

export const socket = io(API_SOCKET_URL, {
  transports: ["websocket"],
  timeout: 10000,
  reconnection: true,
  reconnectionDelay: 2000,
  reconnectionAttempts: 5,
  autoConnect: false,
});
