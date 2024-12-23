// pages/api/updateresources.js
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Log everything we receive
  console.log('API Route Hit!');
  console.log('Request method:', req.method);
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);

  // Just return success for testing
  return res.status(200).json({ 
    success: true, 
    message: 'API endpoint reached successfully',
    receivedData: req.body 
  });
}
