# SOP: Plant Analysis and Diagnostics

## Goal
Identify a plant from an image and provide detailed health diagnostics and care instructions.

## Inputs
- `image_path`: Path to the image file (JPG, PNG).

## Tools
- `Gemini 1.5 Flash` (or Pro): Used for image analysis and text generation.

## Steps
1. Load the image from `image_path`.
2. Construct a prompt for Gemini following the output format below.
3. Call the Gemini API.
4. Process the response and return it as JSON.

## Output Format (JSON)
The output should be a strictly valid JSON object:
```json
{
  "plant_name": "Common and Scientific Name",
  "is_healthy": true/false,
  "confidence": 0.0-1.0,
  "summary": "Short 1-2 sentence description",
  "care_instructions": {
    "light": "Requirements for light",
    "water": "Frequency and amount",
    "environment": "Best indoor/outdoor placement",
    "temperature": "Ideal range"
  },
  "diagnostics": {
    "status": "Healthy / [Problem Name]",
    "description": "What is wrong with the plant (if unhealthy)",
    "recommendations": ["Action item 1", "Action item 2"]
  }
}
```

## Edge Cases
- **No plant found**: Return a JSON with `plant_name: "Unknown"` and an appropriate message in `summary`.
- **Blurry image**: Ask the user for a clearer photo.
- **Multiple plants**: Focus on the most prominent plant in the foreground.
