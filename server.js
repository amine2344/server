import express from 'express';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

const livekitHost = 'https://my.livekit.host';
const apiKey = "APIew9aRkyjMwkg";
const apiSecret = "7O5Guflr9se47Z1Zk1MsjoIwwtNuIrjAs0dx3nN4fmmB";
const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);

const createToken = async (roomName, participantName) => {
  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
    ttl: '10m', // Token valid for 10 minutes
  });
  at.addGrant({ roomJoin: true, room: roomName });

  return at.toJwt();
};

const app = express();
app.use(express.json());

const port = 3000;

// Endpoint to get a token
app.post('/getToken', async (req, res) => {
  const { roomName, participantName } = req.body;
  if (!roomName || !participantName) {
    return res.status(400).json({ error: 'roomName and participantName are required' });
  }

  try {
    const token = await createToken(roomName, participantName);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

// Endpoint to create a room
app.post('/createRoom', async (req, res) => {
  const { name, emptyTimeout = 600, maxParticipants = 20 } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Room name is required' });
  }

  try {
    const room = await roomService.createRoom({ name, emptyTimeout, maxParticipants });
    res.json({ room });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Endpoint to list rooms
app.get('/listRooms', async (req, res) => {
  try {
    const rooms = await roomService.listRooms();
    res.json({ rooms });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list rooms' });
  }
});

// Endpoint to delete a room
app.delete('/deleteRoom', async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Room name is required' });
  }

  try {
    await roomService.deleteRoom(name);
    res.json({ message: 'Room deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
