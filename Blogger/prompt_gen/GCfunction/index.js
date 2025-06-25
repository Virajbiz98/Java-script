// index.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PredictionServiceClient } = require('@google-cloud/aiplatform'); // New dependency for Vertex AI!

// --- Vertex AI Configuration for Image Generation ---
// IMPORTANT:
// 1. Ensure 'Vertex AI API' is enabled in your Google Cloud Project.
// 2. Choose a 'location' (region) where Imagen models are available (e.g., 'us-central1').
// 3. 'modelName' specifies the Imagen model version. 'imagegeneration@005' is a common one.
//    You might check Vertex AI documentation for the latest recommended model.
const projectId = process.env.GOOGLE_CLOUD_PROJECT; // Automatically available in Cloud Functions
const location = 'us-central1'; // Recommended region for Imagen. Change if needed.
const publisher = 'google';
const modelName = 'imagegeneration@005'; // Imagen model ID

exports.aiProxyFunction = async (req, res) => {
    // Set CORS headers for all responses to allow your Blogger site to access this function
    // IMPORTANT: In a production environment, restrict Access-Control-Allow-Origin to your specific Blogger domain.
    res.set('Access-Control-Allow-Origin', '*'); 
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600'); // Cache preflight response for 1 hour

    // Handle preflight requests (CORS preflight checks)
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    // Ensure it's a POST request
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed. Only POST requests are accepted.');
    }

    // Get API Key from environment variables (secure way)
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 
    if (!GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY environment variable not set.');
        return res.status(500).send('Server configuration error: Gemini API Key missing.');
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    try {
        // Destructure expected parameters from the request body
        const { actionType, userInput, useCase, tone, creativity } = req.body; 

        if (!actionType) {
            return res.status(400).json({ error: 'Missing actionType in request body.' });
        }

        let responseData = {};

        if (actionType === 'generatePrompt') {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

            let promptText = `Generate a highly detailed and optimized prompt for an AI model based on the following user input and parameters.
            User Input: "${userInput}"
            Use Case: ${useCase}
            Tone: ${tone}
            Creativity Level: ${creativity}
            Ensure the output is a direct prompt suitable for an AI model, without any conversational filler or introductory/concluding remarks.`;

            if (useCase === 'imagegenerate') {
                promptText += ` Focus on visual details. Include descriptions of lighting, composition, style (e.g., 'photorealistic', 'oil painting', 'cyberpunk', 'watercolor'), colors, and setting. If the user input is abstract, interpret it visually. The generated prompt should be directly usable by a text-to-image AI.`;
            } else if (useCase === 'videogenerate' || useCase === 'storyvideo') {
                 promptText += ` Focus on cinematic details, scene progression, character actions, camera angles, and emotional tone. Describe the setting, characters, and key events. The prompt should be suitable for a text-to-video AI.`;
            } else if (useCase === 'website') {
                promptText += ` Focus on web design elements, page layout, content sections, user interaction, color schemes, and target audience. Specify features, navigation, and overall aesthetic. The prompt should be suitable for a text-to-website AI or web developer.`;
            }

            const result = await model.generateContent(promptText);
            const response = await result.response;
            const enhancedPrompt = response.text();
            responseData = { enhancedPrompt: enhancedPrompt };

        } else if (actionType === 'generateImage') {
            const imagePrompt = userInput; // The prompt to generate image from

            // Ensure GOOGLE_CLOUD_PROJECT is available (usually set automatically in Cloud Functions)
            if (!projectId) {
                console.error('GOOGLE_CLOUD_PROJECT environment variable not set. Cannot use Vertex AI for image generation.');
                return res.status(500).send('Server configuration error: Google Cloud Project ID missing.');
            }

            // Initialize Vertex AI Prediction Service Client
            const clientOptions = {
                apiEndpoint: `${location}-aiplatform.googleapis.com`,
            };
            const client = new PredictionServiceClient(clientOptions);

            // Construct the request payload for Imagen
            const instance = {
                prompt: imagePrompt,
            };
            const instances = [instance];
            const parameters = {
                sampleCount: 1, // Number of images to generate (max 4)
                sampleImageSize: '1024', // or '512', '256'
                // You can add more parameters here if desired, e.g., seed, aspect ratio, negative_prompt
            };

            const formattedParent = client.locationPath(projectId, location);

            const request = {
                endpoint: formattedParent,
                instances: instances,
                parameters: parameters,
                model: `projects/${projectId}/locations/${location}/publishers/${publisher}/models/${modelName}`,
            };

            console.log(`Sending image generation request to Vertex AI for prompt: "${imagePrompt}"`);

            // Make the prediction call
            const [response] = await client.predict(request);

            // Process the response
            if (response.predictions && response.predictions.length > 0) {
                const prediction = response.predictions[0];
                if (prediction.bytesBase64Encoded) {
                    // Imagen returns base64 encoded image data
                    const imageUrl = `data:image/png;base64,${prediction.bytesBase64Encoded}`;
                    responseData = { imageUrl: imageUrl };
                } else {
                    throw new Error("No base64 encoded image found in Vertex AI response. Prediction structure might have changed or no image was generated.");
                }
            } else {
                throw new Error("No predictions found in Vertex AI response. Image generation might have failed.");
            }

        } else {
            return res.status(400).json({ error: 'Invalid actionType specified.' });
        }

        res.status(200).json(responseData);

    } catch (error) {
        console.error('Error in Cloud Function:', error.message);
        // Provide a more user-friendly error for common issues
        if (error.message.includes('permission') || error.message.includes('auth')) {
            res.status(500).json({ error: `Authentication/Permission error with Google Cloud: ${error.message}. Ensure Vertex AI API is enabled and your Cloud Function's service account has 'Vertex AI User' role.` });
        } else if (error.message.includes('location') || error.message.includes('model')) {
             res.status(500).json({ error: `Vertex AI configuration error: ${error.message}. Check the 'location' and 'modelName' for Imagen in your Cloud Function code.` });
        }
        else {
            res.status(500).json({ error: `Internal server error during AI operation: ${error.message}` });
        }
    }
};