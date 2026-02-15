import os
import json
import base64
import sys
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

# Configure OpenRouter API
api_key = os.getenv("OPENROUTER_API_KEY")
if not api_key:
    print(json.dumps({"error": "OPENROUTER_API_KEY not found in .env"}))
    sys.exit(1)

# Initialize OpenAI client pointed to OpenRouter
client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key=api_key,
)

def analyze_plant(image_path):
    try:
        # Load and encode the image
        with open(image_path, "rb") as f:
            base64_image = base64.b64encode(f.read()).decode('utf-8')
        
        prompt = """
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
        """
        
        # Call OpenRouter (using Google's Gemini 2.0 Flash for speed and reliability)
        response = client.chat.completions.create(
            model="google/gemini-2.0-flash-001",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        },
                    ],
                }
            ],
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        return json.loads(content)
        
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
    else:
        result = analyze_plant(sys.argv[1])
        print(json.dumps(result))
