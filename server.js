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
            headless: 'new', // নতুন হেডলেস মোড যা অরিজিনাল ব্রাউজারের মত কাজ করে
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--disable-web-security' // ফায়ারবেস বা এপিআই ব্লক হওয়া আটকাবে
            ]
        });
        
        const page = await browser.newPage();

        // 🌟 THE MASTER HACK: ব্রাউজারকে বোকা বানানো 🌟
        // ব্রাউজারকে বোঝানো হচ্ছে যে পেজটি স্ক্রিনে ওপেন আছে, ফলে Web Worker বা Firebase কখনোই ঘুমাবে না
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(document, 'hidden', { value: false });
            Object.defineProperty(document, 'visibilityState', { value: 'visible' });
        });
        
        // Render টার্মিনালে ভেতরের মেসেজ দেখার জন্য
        page.on('console', msg => console.log('[HTML LOG]:', msg.text()));
        
        // আপনার HTML পেজ রান হচ্ছে
        await page.goto(`http://localhost:${PORT}`, { waitUntil: 'domcontentloaded', timeout: 0 });
        
        console.log("✅ Browser started successfully! Web Worker & Firebase are running at FULL SPEED.");
        
    } catch (error) {
        console.error("❌ Browser Error:", error);
    }
});
