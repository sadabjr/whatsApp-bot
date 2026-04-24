const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion 
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
// No AI SDK needed — Groq uses a simple REST API via native fetch

// SECURE FIREBASE URL FROM GITHUB SECRETS OR ENVIRONMENT VARIABLES
// Note: If running locally, you can set this in your shell or use a .env file
const FIREBASE_URL = process.env.FIREBASE_URL;

const orderStates = {};

/**
 * Function to fetch the dynamic menu from your Firebase App
 */
async function getMenuFromApp() {
    try {
        if (!FIREBASE_URL) {
            console.error("FIREBASE_URL is not defined in environment variables.");
            return [];
        }

        // Clean the URL to avoid double slashes
        const baseUrl = FIREBASE_URL.endsWith('/') ? FIREBASE_URL.slice(0, -1) : FIREBASE_URL;
        
        // Fetch from dishes.json (matching your admin panel)
        console.log(`Fetching menu from: ${baseUrl}/dishes.json`);
        const response = await fetch(`${baseUrl}/dishes.json`); 
        const data = await response.json();
        
        if (!data) {
            console.log("No data found in 'dishes' path.");
            return [];
        }

        // Convert Firebase object into an array
        return Object.keys(data).map(key => ({
            id: key,
            name: data[key].name,
            price: data[key].price,
            imageUrl: data[key].imageUrl
        }));
    } catch (error) {
        console.error("Failed to fetch menu:", error);
        return [];
    }
}

async function startBot() {
    if (!FIREBASE_URL) {
        console.log("⚠️ WARNING: FIREBASE_URL is missing. Fetching menu will fail.");
        // For local development, you might want to uncomment the line below:
        // process.exit(1);
    }

    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true, // Enabled for easy login
        logger: pino({ level: 'silent' }),
        browser: ["Digita Marketing Bot", "Chrome", "1.0.0"]
    });

    // Save credentials whenever they are updated
    sock.ev.on('creds.update', saveCreds);

    // Listen for connection updates
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('Scan this QR code to login:');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed. Reconnecting:', shouldReconnect);
            if (shouldReconnect) {
                startBot();
            }
        } else if (connection === 'open') {
            console.log('✅ Digita Marketing WhatsApp Bot is now Online!');
        }
    });

    // Handle incoming messages
    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        const lowercaseBody = body.toLowerCase().trim();

        // 1. Show the full menu list
        if (lowercaseBody === 'menu') {
            const menu = await getMenuFromApp();
            if (menu.length === 0) {
                await sock.sendMessage(from, { text: "The service list is currently empty." });
                return;
            }

            let menuText = "*🌟 DIGITA MARKETING SERVICES 🌟*\n\n";
            menu.forEach((item, index) => {
                menuText += `*${index + 1}. ${item.name}*\n`;
            });
            menuText += "\nReply with the *Name* of the service to see full details and pricing!";
            
            await sock.sendMessage(from, { text: menuText });
            return;
        }

        // 2. Check if the user is asking for a specific service detail (e.g., "SEO")
        const menu = await getMenuFromApp();
        const selectedItem = menu.find(item => item.name.toLowerCase() === lowercaseBody);

        if (selectedItem) {
            // Show typing indicator
            await sock.sendPresenceUpdate('composing', from);

            const detailMessage = `*${selectedItem.name.toUpperCase()}*\n\n` +
                                 `💰 *Price:* ${selectedItem.price}\n\n` +
                                 `Interested? Reply with "Order" to get started with this service!`;

            // Send Image + Caption
            if (selectedItem.imageUrl) {
                await sock.sendMessage(from, { 
                    image: { url: selectedItem.imageUrl }, 
                    caption: detailMessage 
                });
            } else {
                await sock.sendMessage(from, { text: detailMessage });
            }
            return;
        }

        // 3. If no menu/service match, use Groq AI (Free, Fast, Llama 3)
        try {
            if (!process.env.GROQ_API_KEY) {
                await sock.sendMessage(from, { text: "Hello! I am the Digita Marketing Assistant. Type 'menu' to see our services." });
                return;
            }

            await sock.sendPresenceUpdate('composing', from);

            const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'llama3-8b-8192',
                    messages: [
                        {
                            role: 'system',
                            content: `You are the official AI assistant for "Digita Marketing", a premier Digital Marketing Agency.
- Services: AI SEO, AEO, Google/Meta Ads, Social Media Marketing, Web Development, Marketing Automation.
- Locations: Gorakhpur (Ghosh Company Chowk) and Lucknow.
- Contact: digitamarketing90@gmail.com | +91 9305243187.
Keep replies short (2-3 sentences). Encourage users to type "menu" for pricing.`
                        },
                        {
                            role: 'user',
                            content: body
                        }
                    ],
                    max_tokens: 150
                })
            });

            const groqData = await groqResponse.json();
            const responseText = groqData.choices?.[0]?.message?.content || 'Sorry, I could not process your request right now.';

            await sock.sendMessage(from, { text: responseText });
        } catch (err) {
            console.error("Groq AI Error:", err);
        }
    });
}

startBot().catch(err => console.error("Critical error in startBot:", err));
