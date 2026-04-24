const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion 
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');

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
            console.error("FIREBASE_URL is not defined.");
            return [];
        }

        // Assuming your Firebase path for the menu (updated to match admin panel)
        const response = await fetch(`${FIREBASE_URL}/dishes.json`); 
        const data = await response.json();
        
        if (!data) return [];

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

        // Example: Show menu when someone says "menu"
        if (body.toLowerCase() === 'menu') {
            const menu = await getMenuFromApp();
            if (menu.length === 0) {
                await sock.sendMessage(from, { text: "The menu is currently empty or unavailable." });
                return;
            }

            let menuText = "*🌟 Digita MARKETING MENU 🌟*\n\n";
            menu.forEach((item, index) => {
                menuText += `*${index + 1}. ${item.name}*\nPrice: ${item.price}\n\n`;
            });
            menuText += "Reply with the name of the item to start your order!";
            
            await sock.sendMessage(from, { text: menuText });
        }
    });
}

startBot().catch(err => console.error("Critical error in startBot:", err));
