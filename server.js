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

// cron-job এর জন্য পিং সিস্টেম
app.get('/ping', (req, res) => res.send("OK"));

// 0.0.0.0 দেওয়া হলো যাতে Render সার্ভার সঠিকভাবে কাজ করে
app.listen(PORT, '0.0.0.0', async () => {
    console.log(`✅ Web Server started on port ${PORT}`);
    startBackgroundBot();
});

async function startBackgroundBot() {
    try {
        console.log("🚀 Launching Background Browser in Render...");
        
        const browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--no-zygote'
            ]
        });
        
        const page = await browser.newPage();

        // ব্রাউজারকে বোঝানো হচ্ছে যে পেজটি স্ক্রিনে ওপেন আছে, যাতে Web Worker না ঘুমায়
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(document, 'visibilityState', {get: () => 'visible'});
            Object.defineProperty(document, 'hidden', {get: () => false});
        });
        
        // Render টার্মিনালে মেসেজ দেখার জন্য
        page.on('console', msg => console.log('[HTML LOG]:', msg.text()));
        
        // ⚠️ সবচেয়ে বড় ফিক্স: localhost এর বদলে 127.0.0.1 দেওয়া হলো ⚠️
        console.log("🔗 Connecting to HTML...");
        await page.goto(`http://127.0.0.1:${PORT}`, { waitUntil: 'networkidle2', timeout: 60000 });
        
        console.log("✅✅ SUCCESS! Background browser is running! You can close your phone now!");

        // ক্র্যাশ করলে অটো রিস্টার্ট
        browser.on('disconnected', () => {
            console.log("❌ Browser crashed! Auto-restarting...");
            setTimeout(startBackgroundBot, 5000);
        });

    } catch (error) {
        console.error("❌ Launch Error:", error);
        setTimeout(startBackgroundBot, 10000);
    }
}
