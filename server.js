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
            headless: true, // ব্রাউজার হাইড থাকবে
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                // --single-process বাদ দেওয়া হয়েছে কারণ এটি ক্র্যাশ করছিল
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding'
            ]
        });
        
        const page = await browser.newPage();
        
        // Render টার্মিনালে ভেতরের মেসেজ দেখার জন্য
        page.on('console', msg => console.log('[BOT]:', msg.text()));
        
        // আপনার HTML পেজ রান হচ্ছে
        await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0', timeout: 0 });
        
        console.log("✅ Browser started successfully! Forwarder is LIVE.");
        
        // 🌟 THE MAGIC HEARTBEAT 🌟
        // এটি প্রতি ৫ সেকেন্ড পর পর ব্রাউজারকে সজাগ রাখবে, ফলে এডমিন প্যানেল থেকে কন্ট্রোল করলে সাথে সাথে কাজ করবে!
        setInterval(async () => {
            try {
                await page.evaluate(() => {
                    // একটি ফেক ইভেন্ট ট্রিগার করা হচ্ছে যেন Firebase ঘুমিয়ে না পড়ে
                    window.dispatchEvent(new Event('focus'));
                });
            } catch (e) {}
        }, 5000);

    } catch (error) {
        console.error("❌ Browser Error:", error);
    }
});
