import { io } from 'socket.io-client'

const URL = 'https://socketio.vtracksolutions.com:1102'

export const socket = io(URL, {
  autoConnect: false,
  query: { clientId: 'TEST_CLIENT' }, // This gets updated later on with client code.
  transports: ['websocket', 'polling', 'flashsocket'],
})
