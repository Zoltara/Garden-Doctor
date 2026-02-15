import OpenAI from 'openai';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { image } = req.body;

    if (!image) {
        return res.status(400).json({ error: 'No image provided' });
    }

    // Remove data:image/...;base64, prefix if it exists
    const base64Image = image.replace(/^data:image\/\w+;base64,/, '');

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    const client = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: apiKey,
        defaultHeaders: {
            'HTTP-Referer': 'https://garden-doctor.vercel.app', // Optional: for OpenRouter rankings
            'X-Title': 'Garden Doctor',
        }
    });

    try {
        const prompt = `
        Analyze this plant image as an expert botanist.
        
        1. Identify the plant. Use the format: "Common Name (Scientific Name)".
        2. Health status: Is the plant healthy? (true/false).
        3. Provide a short summary of the plant's condition.
        4. Care instructions: Provide details for light, water, environment, and temperature.
        5. Diagnostics: 
           - Status: Name the specific issue or "Healthy".
           - Description: Describe visible symptoms.
           - Recommendations: Provide a list of actionable steps for care or recovery.
        
        Return STRICTLY VALID JSON:
        {
          "plant_name": "string",
          "is_healthy": boolean,
          "summary": "string",
          "care_instructions": {
            "light": "string",
            "water": "string",
            "environment": "string",
            "temperature": "string"
          },
          "diagnostics": {
            "status": "string",
            "description": "string",
            "recommendations": ["string"]
          }
        }
    `;

        const response = await client.chat.completions.create({
            model: "google/gemini-2.0-flash-001",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`
                            }
                        },
                    ],
                }
            ],
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        const result = JSON.parse(content);

        return res.status(200).json(result);
    } catch (error) {
        console.error('Analysis error:', error);
        return res.status(500).json({
            error: 'Analysis failed',
            details: error.message
        });
    }
}
