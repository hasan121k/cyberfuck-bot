const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

// আপনার মেইন HTML ফাইল সার্ভ করবে
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// সার্ভারকে ঘুম থেকে জাগিয়ে রাখার জন্য পিং সিস্টেম
app.get('/ping', (req, res) => {
    res.send("Bot is Awake!");
});

let browserInstance = null;

// ব্যাকগ্রাউন্ড ব্রাউজার চালু করার ফাংশন
async function startBackgroundBot() {
    if (browserInstance) return; // যদি আগে থেকেই চলে, তাহলে নতুন করে চালাবে না
    
    try {
        console.log("🚀 Launching Background Browser in Render...");
        
        browserInstance = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding'
            ]
        });
        
        const page = await browserInstance.newPage();

        // ব্রাউজারকে বোঝানো হচ্ছে যে পেজটি স্ক্রিনে ওপেন আছে
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(document, 'hidden', { value: false });
            Object.defineProperty(document, 'visibilityState', { value: 'visible' });
        });
        
        // Render টার্মিনালে মেসেজ দেখার জন্য
        page.on('console', msg => console.log('[BOT RUNNING]:', msg.text()));
        
        // ব্যাকগ্রাউন্ডে আপনার HTML ওপেন করা হলো
        await page.goto(`http://localhost:${PORT}`, { waitUntil: 'domcontentloaded', timeout: 0 });
        
        console.log("✅ Background Browser is LIVE! You can close your phone now.");

        // 🌟 জাদুকরী ট্রিক: যদি র‍্যামের অভাবে ব্রাউজার ক্র্যাশ করে, তবে সে নিজে নিজে আবার চালু হবে!
        browserInstance.on('disconnected', () => {
            console.log("❌ Browser crashed! Auto-restarting in 5 seconds...");
            browserInstance = null;
            setTimeout(startBackgroundBot, 5000);
        });

    } catch (error) {
        console.error("❌ Launch Error:", error);
        browserInstance = null;
        // এরর হলেও ৫ সেকেন্ড পর আবার ট্রাই করবে
        setTimeout(startBackgroundBot, 5000); 
    }
}

// সার্ভার চালু হওয়া মাত্রই ব্যাকগ্রাউন্ড বট চালু হবে
app.listen(PORT, () => {
    console.log(`✅ Web Server started on port ${PORT}`);
    startBackgroundBot();
});
