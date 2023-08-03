import fetch from 'node-fetch';
const apiKey : string = '5b3ce3597851110001cf6248cd8db93af9974f169e6ef3b17d7a884c';
/* 
serverless function to provide access to the OpenRouteService api without
exposing the api key to users.
*/
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const apiUrl = 'https://api.openrouteservice.org/v2/directions/foot-hiking'; // Replace with the actual API endpoint URL
    const requestBody = req.body; // Assuming the request body contains the data for the POST request

    const response : any = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
        'Content-Type': 'application/json',
        'Authorization': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      // Handle the API error response
      const errorResponse : any = await response.json();
      throw new Error(errorResponse.message || 'API request failed');
    }

    // Parse the successful API response
    const responseData = await response.json();

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}