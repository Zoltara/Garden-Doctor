# 🌿 Garden Doctor AI

Garden Doctor is a modern, AI-powered botanical companion that helps you identify plants and diagnose health issues from a single photograph.

## ✨ Features
- **Plant Identification**: Accurately identifies thousands of plant species.
- **Health Diagnosis**: Detects symptoms of disease, pests, or nutrient deficiencies.
- **Care Instructions**: Provides tailored advice for light, water, and temperature.
- **Premium Design**: Sleek, nature-inspired interface with Dark/Light mode support.
- **Vercel Optimized**: Ready for instant deployment using serverless functions.

## 🚀 Deployment (Vercel)
1. **Push to GitHub**:
   - Create a new repository on GitHub.
   - Run `git remote add origin YOUR_URL`
   - Run `git branch -M main`
   - Run `git push -u origin main`

2. **Connect to Vercel**:
   - Import your GitHub repository into Vercel.
   - **Important**: Add the following Environment Variable in the Vercel Dashboard:
     - `OPENROUTER_API_KEY`: Your OpenRouter API key.

## 🛠 Local Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up environment:
   - Create a `.env` file with `OPENROUTER_API_KEY`.
3. Start the app:
   ```bash
   npm run dev
   ```

## 🧠 Tech Stack
- **Frontend**: React, Vite, Framer Motion, Lucide Icons.
- **Styling**: Vanilla CSS (Modern custom properties & Glassmorphism).
- **Backend**: Node.js (Vercel Serverless Functions).
- **AI**: Gemini 2.0 Flash via OpenRouter.


***********   If run locally:
***********    npm run dev
***********    npm run backend
