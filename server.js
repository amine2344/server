import express from 'express';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

const app = express();
const port = 3000;

const livekitHost = 'wss://phenix-vh8jhnzm.livekit.cloud'; // Replace with your LiveKit server URL
const apiKey = 'APIew9aRkyjMwkg'; // Replace with your API key
const apiSecret = '7O5Guflr9se47Z1Zk1MsjoIwwtNuIrjAs0dx3nN4fmmB'; // Replace with your API secret

const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);

app.use(express.json());

// Generate a generic token (for the default quickstart-room)
const createToken = async () => {
  const roomName = 'quickstart-room';
  const participantName = 'quickstart-username';

  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
    ttl: '10m', // Token expires after 10 minutes
  });
  at.addGrant({ roomJoin: true, room: roomName });

  return await at.toJwt();
};

// Generate a room-specific token
const createRoomToken = async (roomName, participantName) => {
  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
    ttl: '10m', // Token expires after 10 minutes
  });
  at.addGrant({ roomJoin: true, room: roomName });

  return await at.toJwt();
};

// Create a new room
app.post('/createRoom', async (req, res) => {
  const { name } = req.body;
  try {
    const room = await roomService.createRoom({
      name,
      emptyTimeout: 10 * 60, // 10 minutes timeout when room is empty
      maxParticipants: 20,
    });
    res.json({ msg: 'Room created successfully', room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error creating room', error: err.message });
  }
});

// List all rooms
app.get('/listRooms', async (req, res) => {
  try {
    const rooms = await roomService.listRooms();
    res.json({ msg: 'Rooms fetched successfully', rooms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error fetching rooms', error: err.message });
  }
});

// Delete a room
app.delete('/deleteRoom', async (req, res) => {
  const { name } = req.body;
  try {
    await roomService.deleteRoom(name);
    res.json({ msg: 'Room deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error deleting room', error: err.message });
  }
});

// Endpoint to get a generic token
app.get('/getToken', async (req, res) => {
  try {
    const token = await createToken();
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error generating token', error: err.message });
  }
});

// Endpoint to get a room-specific token
app.post('/getRoomToken', async (req, res) => {
  const { roomName, participantName } = req.body;
  if (!roomName || !participantName) {
    return res.status(400).json({ msg: 'roomName and participantName are required' });
  }

  try {
    const token = await createRoomToken(roomName, participantName);
    res.json({ msg: 'Token generated successfully', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error generating room token', error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
