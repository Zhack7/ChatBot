// ==========================
// Import library
// ==========================
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');

// Gemini AI
const genai = require('@google/genai');
const { TextGenerationClient } = genai;

const clientGen = new TextGenerationClient({
  apiKey: process.env.GEMINI_API_KEY,
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  location: process.env.GOOGLE_CLOUD_LOCATION || 'global',
});

// ==========================
// Inisialisasi client WhatsApp
// ==========================
const client = new Client({
    authStrategy: new LocalAuth(), // Simpan sesi login agar tidak perlu scan ulang
});

client.on('qr', qr => {
    console.log('📱 Scan QR code berikut menggunakan WhatsApp kamu:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Bot WhatsApp siap digunakan!');
});

// ==========================
// Fungsi Gemini AI
// ==========================
async function askGemini(prompt) {
  const response = await clientGen.generateContent({
    model: 'models/gemini-2.5-flash',
    prompt: { text: prompt },
  });
  return response.text;
}

// ==========================
// Balasan otomatis
// ==========================
client.on('message', async msg => {
    console.log(`Pesan diterima dari ${msg.from}: ${msg.body}`);
    const pesan = msg.body.toLowerCase();

    if (pesan === 'hi bot') {
        msg.reply('Hello, Can I help You my Friend? \n 1.About Me\n 2.Syntax \n 3. Chat Bot Schedule');
    } else if (pesan === 'siapa kamu') {
        msg.reply('Saya bot yang dibuat dengan Node.js dan whatsapp-web.js 💻');
    } else if (pesan.includes('/time')) {
        const now = new Date();
        msg.reply(`Sekarang jam ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')} 🕒`);
    } else if (pesan === '!id') {
        msg.reply(`ID chat ini adalah:\n\n${msg.from}`);
        console.log(`📋 ID chat: ${msg.from}`);
    } else if (pesan === '1'){
        msg.reply('I am a ChatBot Created By Zhack to help You Learn English 🙋‍♂️')
    } else if (pesan === '2'){
        msg.reply(' 1.hi bot = for access the menu\n 2. /time = check the current time \n 3. !id = check grup id \n 4. /ai = for access gemini ai ' )
    } else if (pesan === '3'){
        msg.reply('I Will Send Massage at 8.am, 12.pm, 16.pm, 18.pm, and 9.pm')
    } else {
        // Fallback ke Gemini AI
        try {
            const jawaban = await askGemini(msg.body);
            msg.reply(jawaban);
        } catch (err) {
            console.error('Error saat memanggil Gemini:', err);
            msg.reply('Maaf, saya mengalami kendala AI saat ini.');
        }
    }
});

// ==========================
// Target Chat untuk pesan otomatis
// ==========================
const targetChatId = process.env.TARGET_CHAT_ID; // nomor atau ID grup dari environment

function kirimPesanOtomatis(pesan) {
    client.sendMessage(targetChatId, pesan);
    console.log(`🕒 Pesan terkirim: "${pesan}"`);
}

// ==========================
// Jadwal pesan otomatis
// ==========================
cron.schedule('0 8 * * *', () => {
    kirimPesanOtomatis('Good Morning Everyone, have You Got Your Breakfast? 😁🍚');
});

cron.schedule('0 12 * * *', () => {
    kirimPesanOtomatis('Good Afternoon Ma Friends😁 \n Do We Have a Class? 😪');
});

cron.schedule('0 16 * * *', () => {
    kirimPesanOtomatis('Hello Guys, This Is a ChatBot DEMO😁\n I will Text Again at 8.am, 12.pm, 16.pm, 18.pm, and 9.pm.  \n See You Latter 😘');
});

cron.schedule('0 18 * * *', () => {
    kirimPesanOtomatis('Hi, How Was Your Day? 🤗\n Feels Free Guys, Tell Us About Your days😁');
});

cron.schedule('0 21 * * *', () => {
    kirimPesanOtomatis('Good Night Guys🥱 \n I Remind You All Guys to Not Sleep late at Night😁\n cuz Oh ini zona PapSel to🤣');
});

// ==========================
// Start bot
// ==========================
client.initialize();
