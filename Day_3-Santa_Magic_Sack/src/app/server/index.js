import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import CryptoJS from 'crypto-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(join(__dirname, '../dist')));

const scores = [];
const FLAG = "RM{S4NT4_H0PE_Y0U_D1DN'T_CHEAT}";
const ENCRYPTION_KEY = 'S4NT4_S3CR3T_K3Y_T0_ENCRYPT_DATA';

function decryptData(encryptedData) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

function generateChecksum(playerName, score, salt) {
  const data = `${playerName}-${score}-${salt}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

function validateScore(playerName, score, checksum, salt) {
  const expectedChecksum = generateChecksum(playerName, score, salt);
  return checksum === expectedChecksum;
}

function addSantaToScores() {
  const santaPlayerName = "santa";
  const santaScore = 133337;

  scores.push({
    playerName: santaPlayerName,
    score: santaScore,
    timestamp: Date.now()
  });

  console.log('Santa added to the scoreboard with 13337 points!');
}

app.post('/api/scores', (req, res) => {
  const { data: encryptedData } = req.body;

  if (!encryptedData) {
    return res.status(400).json({ error: 'Missing encrypted data' });
  }

  const decryptedData = decryptData(encryptedData);
  
  if (!decryptedData) {
    return res.status(400).json({ error: 'Invalid encrypted data' });
  }

  const { playerName, score, checksum, salt } = decryptedData;

  if (!playerName || typeof score !== 'number' || !checksum || !salt) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!validateScore(playerName, score, checksum, salt)) {
    return res.status(403).json({ error: 'Invalid score submission' });
  }

  const isNewRecord = scores.length === 0 || score > Math.max(...scores.map(s => s.score));

  if (isNewRecord) {
    res.json({ 
      success: true,
      isNewRecord,
      flag: FLAG,
      message: "For reasons of maximum integer size, to not disturb other users your score will not be saved, but well done!"
    });
  } else {
    scores.push({ playerName, score, timestamp: Date.now() });
    res.json({ 
      success: true,
      isNewRecord,
      message: "Congratz, but not enough .."
    });
  }
});

app.get('/api/scores', (req, res) => {
  const topScores = [...scores]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10000);
  res.json(topScores);
});

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

addSantaToScores();

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
