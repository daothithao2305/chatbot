import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const conversations = {};

app.post('/chat', async (req, res) => {
  const { message, sessionId } = req.body;
  if (!message || !sessionId) {
    return res.status(400).json({ error: 'Missing message or sessionId' });
  }

  if (!conversations[sessionId]) {
    conversations[sessionId] = [];
  }

  conversations[sessionId].push({ role: 'user', content: message });

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: conversations[sessionId],
    });

    const botMessage = response.choices[0].message.content;
    conversations[sessionId].push({ role: 'assistant', content: botMessage });

    res.json({ botMessage });
  } catch (err) {
    console.error('OpenAI API Error:', err.message);
    res.status(500).json({ error: 'Failed to get response from OpenAI' });
  }
});

app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});
