// pages/api/plaiceholder.ts

import { getPlaiceholder } from 'plaiceholder';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { imageUrl } = req.query;

  if (typeof imageUrl !== 'string') {
    return res.status(400).json({ error: 'imageUrl query parameter is required' });
  }

  try {
    // Step 1: Fetch the image from the provided URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }

    // Step 2: Convert the image response into a Buffer
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    // Step 3: Pass the Buffer to the getPlaiceholder function
    const { base64 } = await getPlaiceholder(imageBuffer);
    
    res.status(200).json({ base64 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Plaiceholder API error:', errorMessage);
    res.status(500).json({ error: 'Failed to generate placeholder', details: errorMessage });
  }
}