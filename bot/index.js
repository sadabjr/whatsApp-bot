const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion 
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');

// --- FIREBASE ADMIN SETUP ---
// Note: In production, use a service account JSON file.
// For now, I'll use the Realtime Database URL and assume the environment has access or use public rules if dev.
// Ideally: const serviceAccount = require('./serviceAccount.json');
const firebaseConfig = {
    databaseURL: "https://whatsapp-agent-209a2-default-rtdb.firebaseio.com"
};

// Initialize Firebase Admin (Assuming environment credentials or public access for this demo)
// In a real production setup, you MUST provide a service account.
let adminApp;
try {
    adminApp = initializeApp(firebaseConfig);
} catch (e) {
    console.error("Firebase Admin already initialized or failed:", e.message);
}

const db = getDatabase();

/**
 * Robust WhatsApp Bot Class
 */
class WhatsAppBot {
    constructor(userId) {
        this.userId = userId;
        this.sock = null;
        this.state = null;
        this.saveCreds = null;
        this.config = {
            businessName: "Digita Marketing",
            welcomeMsg: "Hi! I'm the {businessName} Assistant. Type *menu* to see our services!",
            status: "offline"
        };
    }

    async init() {
        // 1. Listen for config changes
        const configRef = db.ref(`botConfigs/${this.userId}`);
        configRef.on('value', (snapshot) => {
            if (snapshot.exists()) {
                this.config = { ...this.config, ...snapshot.val() };
                console.log(`[Bot ${this.userId}] Config updated:`, this.config.businessName);
            }
        });

        await this.connect();
    }

    async connect() {
        const { state, saveCreds } = await useMultiFileAuthState(`auth_info_${this.userId}`);
        const { version } = await fetchLatestBaileysVersion();

        this.sock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: false, // We'll send it to Firebase instead
            logger: pino({ level: 'silent' }),
            browser: [this.config.businessName || "Marketing Bot", "Chrome", "1.0.0"]
        });

        this.sock.ev.on('creds.update', saveCreds);

        this.sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                console.log(`[Bot ${this.userId}] New QR Code generated`);
                // Emit QR to Firebase for the admin panel to display
                await db.ref(`botConfigs/${this.userId}`).update({ 
                    qr: qr, 
                    status: "offline" 
                });
            }

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log(`[Bot ${this.userId}] Connection closed. Reconnecting:`, shouldReconnect);
                
                await db.ref(`botConfigs/${this.userId}`).update({ status: "offline", qr: "" });

                if (shouldReconnect) {
                    setTimeout(() => this.connect(), 5000); // Reconnect after 5s
                }
            } else if (connection === 'open') {
                console.log(`[Bot ${this.userId}] ✅ Connected!`);
                await db.ref(`botConfigs/${this.userId}`).update({ 
                    status: "online", 
                    qr: "" 
                });
            }
        });

        this.sock.ev.on('messages.upsert', async m => {
            const msg = m.messages[0];
            if (!msg.message || msg.key.fromMe) return;

            const from = msg.key.remoteJid;
            const body = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
            const lowercaseBody = body.toLowerCase().trim();

            // Fetch Services for Menu
            const servicesSnap = await db.ref('dishes').once('value');
            const services = [];
            servicesSnap.forEach(child => {
                services.push({ id: child.key, ...child.val() });
            });

            // 1. Menu Command
            if (lowercaseBody === 'menu') {
                if (services.length === 0) {
                    await this.sock.sendMessage(from, { text: "Our service list is currently being updated. Please check back later!" });
                    return;
                }

                let menuText = `*🌟 ${this.config.businessName.toUpperCase()} SERVICES 🌟*\n\n`;
                services.forEach((item, index) => {
                    menuText += `*${index + 1}. ${item.name}*\n`;
                });
                menuText += "\nReply with the *Name* of the service to see details!";
                
                await this.sock.sendMessage(from, { text: menuText });
                return;
            }

            // 2. Service Detail Check
            const selectedItem = services.find(item => item.name.toLowerCase() === lowercaseBody);
            if (selectedItem) {
                const detailMsg = `*${selectedItem.name.toUpperCase()}*\n\n` +
                                 `💰 *Price:* ${selectedItem.price}\n\n` +
                                 `Interested? Reply with "Contact" to speak with our experts!`;

                if (selectedItem.imageUrl) {
                    await this.sock.sendMessage(from, { 
                        image: { url: selectedItem.imageUrl }, 
                        caption: detailMsg 
                    });
                } else {
                    await this.sock.sendMessage(from, { text: detailMsg });
                }
                return;
            }

            // 3. Default Welcome / Fallback
            const welcome = this.config.welcomeMsg.replace("{businessName}", this.config.businessName);
            await this.sock.sendMessage(from, {
                text: `🤖 ${welcome}\n\nType *menu* to explore our services!\n\n📞 ${this.config.phone || "Contact us"}`
            });
        });
    }
}

// In a real SaaS, you'd loop through all users or run this on demand.
// For now, let's start it for the primary user or a test ID.
// You can pass the User ID as an environment variable.
const USER_ID = process.env.USER_ID || "default_user";
const bot = new WhatsAppBot(USER_ID);
bot.init().catch(err => console.error("Critical Bot Error:", err));

// Prevent process from exiting on errors
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
