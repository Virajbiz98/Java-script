/**
 * Google Cloud Function to act as a backend for a hotel booking chatbot.
 * It receives user messages and chat history, uses the Gemini API to generate responses,
 * and sends them back to the frontend.
 */

// Import necessary modules
const { GoogleGenerativeAI } = require("@google/generative-ai");

// IMPORTANT: Your Gemini API Key.
const API_KEY = "AIzaSyA9kpz2LSTjqXC8Ih9I8qZElR74W6WkwZM"; 

// Initialize the GoogleGenerativeAI client
const genAI = new GoogleGenerativeAI(API_KEY);

// Mock Hotel Data (This will reset with each function invocation, for persistence use Firestore)
const HOTEL_DATA = {
    name: "Gemini Grand Hotel",
    description: "Experience luxury and comfort at the Gemini Grand Hotel, located in the heart of the city.",
    roomTypes: [
        {
            id: "single",
            name: "Single Room",
            description: "A cozy room perfect for solo travelers.",
            pricePerNight: 120,
            capacity: 1,
            amenities: ["Free Wi-Fi", "Mini-bar", "City View"]
        },
        {
            id: "double",
            name: "Double Room",
            description: "Spacious and comfortable, ideal for couples or two guests.",
            pricePerNight: 180,
            capacity: 2,
            amenities: ["Free Wi-Fi", "King-size bed", "Mini-bar", "Balcony"]
        },
        {
            id: "suite",
            name: "Luxury Suite",
            description: "Indulge in ultimate luxury with a separate living area and stunning views.",
            pricePerNight: 350,
            capacity: 4,
            amenities: ["Free Wi-Fi", "Jacuzzi", "Separate living area", "Complimentary breakfast"]
        }
    ],
    // This array will hold our mock bookings.
    bookings: [
        {
            roomId: "single",
            checkInDate: "2025-08-10",
            checkOutDate: "2025-08-12"
        },
        {
            roomId: "double",
            checkInDate: "2025-08-15",
            checkOutDate: "2025-08-16"
        }
    ]
};

/**
 * Helper function to check room availability.
 * This is a simplified check. In a real system, you'd handle partial overlaps,
 * multiple rooms of the same type, etc.
 * @param {string} roomId - The ID of the room type (e.g., "single", "double").
 * @param {string} checkInDateStr - Check-in date string (YYYY-MM-DD).
 * @param {string} checkOutDateStr - Check-out date string (YYYY-MM-DD).
 * @returns {boolean} True if available, false otherwise.
 */
function isRoomAvailable(roomId, checkInDateStr, checkOutDateStr) {
    const requestedCheckIn = new Date(checkInDateStr);
    const requestedCheckOut = new Date(checkOutDateStr);

    for (const booking of HOTEL_DATA.bookings) {
        if (booking.roomId === roomId) {
            const existingCheckIn = new Date(booking.checkInDate);
            const existingCheckOut = new Date(booking.checkOutDate);

            // Check for overlap:
            // (StartA < EndB) && (EndA > StartB)
            if (requestedCheckIn < existingCheckOut && requestedCheckOut > existingCheckIn) {
                return false; // There's an overlap, room is not available
            }
        }
    }
    return true; // No overlapping bookings found for this room type
}

/**
 * Handles HTTP requests to the Cloud Function.
 * @param {Object} req Cloud Function request object.
 * @param {Object} res Cloud Function response object.
 */
exports.chatbotHandler = async (req, res) => {
    // Set CORS headers for all responses to allow requests from your frontend.
    res.set('Access-Control-Allow-Origin', '*'); 

    if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    const { message: userMessage, chatHistory: clientChatHistory } = req.body;

    if (!userMessage) {
        return res.status(400).send('Bad Request: Missing "message" in request body.');
    }

    // Reconstruct chat history for Gemini's context
    let conversation = [];
    if (clientChatHistory && Array.isArray(clientChatHistory)) {
        conversation = [...clientChatHistory];
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

        // UPDATED: Refined system instruction to guide the model's behavior more clearly
        const systemInstruction = `You are a helpful and friendly hotel booking assistant for the ${HOTEL_DATA.name}.
        Your goal is to assist users with booking rooms. When a user asks a general question, please respond conversationally. ONLY use the tool when a booking-related action is clearly requested with sufficient information (room type, check-in, check-out dates).
        
        Here is the hotel information:
        Name: ${HOTEL_DATA.name}
        Description: ${HOTEL_DATA.description}
        
        Available Room Types:
        ${HOTEL_DATA.roomTypes.map(room => 
            `- ${room.name} (ID: ${room.id}): ${room.description} Price: $${room.pricePerNight}/night. Capacity: ${room.capacity} people. Amenities: ${room.amenities.join(', ')}.`
        ).join('\n')}

        Current mock bookings (for availability checks - do not share directly with user):
        ${JSON.stringify(HOTEL_DATA.bookings, null, 2)}

        You have access to the following tool:
        - \`isRoomAvailable(roomId, checkInDateStr, checkOutDateStr)\`: Checks if a specific room type is available for the given dates. Dates must be in 'YYYY-MM-DD' format. Returns true if available, false otherwise.
        
        If the user asks for general information about the hotel or room types, respond directly. If the user wants to book a room, ask for the necessary details step-by-step. Only call the tool when you have all the required arguments (roomId, checkInDate, checkOutDate).
        `;

        // Start a chat session with the model
        const chat = model.startChat({
            history: conversation,
            generationConfig: {
                temperature: 0.7, 
            },
            tools: [
                {
                    functionDeclarations: [
                        {
                            name: "isRoomAvailable",
                            description: "Checks if a specific room type is available for the given check-in and check-out dates.",
                            parameters: {
                                type: "OBJECT",
                                properties: {
                                    roomId: {
                                        type: "STRING",
                                        description: "The ID of the room type (e.g., 'single', 'double', 'suite')."
                                    },
                                    checkInDateStr: {
                                        type: "STRING",
                                        description: "The check-in date in 'YYYY-MM-DD' format."
                                    },
                                    checkOutDateStr: {
                                        type: "STRING",
                                        description: "The check-out date in 'YYYY-MM-DD' format."
                                    }
                                },
                                required: ["roomId", "checkInDateStr", "checkOutDateStr"]
                            }
                        }
                    ]
                }
            ]
        });

        const result = await chat.sendMessage(userMessage);
        const response = result.response;

        let finalReply = "";
        
        // Check for a direct text response first
        if (response.text()) {
            finalReply = response.text();
        } else if (response.functionCall) {
            // Only handle tool calls if the model explicitly makes one
            const functionCall = response.functionCall;
            const { name, args } = functionCall;

            if (name === "isRoomAvailable") {
                const { roomId, checkInDateStr, checkOutDateStr } = args;
                
                const roomExists = HOTEL_DATA.roomTypes.some(room => room.id === roomId);
                const isValidDate = (dateStr) => !isNaN(new Date(dateStr));

                if (!roomExists || !isValidDate(checkInDateStr) || !isValidDate(checkOutDateStr)) {
                    finalReply = "I couldn't process that request. Please provide a valid room type (e.g., single, double, suite) and valid dates (YYYY-MM-DD).";
                } else {
                    const available = isRoomAvailable(roomId, checkInDateStr, checkOutDateStr);
                    const roomName = HOTEL_DATA.roomTypes.find(r => r.id === roomId)?.name || roomId;
                    let toolResponseContent = "";

                    if (available) {
                        HOTEL_DATA.bookings.push({ roomId, checkInDate: checkInDateStr, checkOutDate: checkOutDateStr }); 
                        toolResponseContent = `The ${roomName} is available from ${checkInDateStr} to ${checkOutDateStr}. Your booking is confirmed! Confirmation ID: ${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
                    } else {
                        toolResponseContent = `I'm sorry, the ${roomName} is not available from ${checkInDateStr} to ${checkOutDateStr}. Please try different dates or another room type.`;
                    }

                    const toolResponse = await chat.sendMessage([
                        {
                            functionResponse: {
                                name: "isRoomAvailable",
                                response: {
                                    content: toolResponseContent,
                                },
                            },
                        },
                    ]);
                    finalReply = toolResponse.response.text();
                }
            } else {
                finalReply = "I'm sorry, I don't have a tool for that action.";
            }
        } else {
            // Fallback for unexpected responses
            finalReply = "I'm sorry, I seem to be having a problem. Could you please rephrase that?";
        }

        res.status(200).json({ reply: finalReply });

    } catch (error) {
        console.error('Error in chatbotHandler:', error);
        res.status(500).json({ reply: 'I apologize, but I am currently unable to process your request due to an internal error. Please try again later.' });
    }
};