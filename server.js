const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, async () => {
    console.log(`✅ Server running on port ${PORT}`);

    try {
        console.log("🚀 Starting Chrome Browser in Background...");
        
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--single-process' // Render এর র‍্যাম বাঁচানোর জন্য
            ]
        });
        
        const page = await browser.newPage();
        
        // আপনার HTML পেজ রান হচ্ছে
        await page.goto(`http://localhost:${PORT}`, { timeout: 0 });
        
        console.log("✅ Browser started successfully! Telegram Bot is now LIVE and checking for signals!");
        
    } catch (error) {
        console.error("❌ Browser Crash Error:", error);
    }
});
