import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { websiteContent, query } = req.body;

    if (!websiteContent || !query) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Prepare the prompt
    const prompt = `
      Based on the following website content, please answer this question: "${query}"
      
      Website content:
      ${websiteContent}
      
      Please provide a clear and concise answer based only on the information available in the website content.
    `;

    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    return res.status(200).json({ response });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
} 