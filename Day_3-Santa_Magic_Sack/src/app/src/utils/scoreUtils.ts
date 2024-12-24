import { encryptData, generateScoreChecksum } from './crypto';

export interface ScoreResponse {
  success: boolean;
  isNewRecord?: boolean;
  flag?: string;
}

export async function submitScore(playerName: string, score: number): Promise<ScoreResponse> {
  const { checksum, salt } = generateScoreChecksum(playerName, score);
  
  const payload = {
    playerName,
    score,
    checksum,
    salt,
  };
  
  const encryptedData = encryptData(payload);
  
  try {
    const response = await fetch('/api/scores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: encryptedData }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error submitting score:', error);
    return { success: false };
  }
}

export async function fetchTopScores(): Promise<Array<{
  playerName: string;
  score: number;
  timestamp: number;
}>> {
  try {
    const response = await fetch('/api/scores');
    return await response.json();
  } catch (error) {
    console.error('Error fetching scores:', error);
    return [];
  }
}