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
    const { base64 } = await getPlaiceholder(imageUrl);
    res.status(200).json({ base64 });
  } catch (error) {
    console.error('Plaiceholder API error:', error);
    res.status(500).json({ error: 'Failed to generate placeholder' });
  }
}