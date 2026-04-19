const express = require('express');
const fs = require('fs');
const path = require('path');
const { JSDOM, ResourceLoader } = require('jsdom');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`✅ Web server running on port ${PORT}`);
    startVirtualBrowser();
});

// ভার্চুয়াল ব্রাউজার (JSDOM) চালু করার ফাংশন
function startVirtualBrowser() {
    console.log("🚀 Starting ultra-light Virtual Browser (JSDOM)...");
    
    try {
        const htmlPath = path.join(__dirname, 'index.html');
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');

        // এক্সটার্নাল স্ক্রিপ্ট (যেমন Firebase) লোড করার পারমিশন
        const resourceLoader = new ResourceLoader({
            strictSSL: false,
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36"
        });

        // HTML কে মেমোরিতে রান করানো হচ্ছে
        const dom = new JSDOM(htmlContent, {
            url: `http://localhost:${PORT}/`,
            runScripts: "dangerously", // JS রান করার পারমিশন
            resources: resourceLoader,
            pretendToBeVisual: true
        });

        // Fetch API যুক্ত করা হচ্ছে (যাতে আপনার টেলিগ্রাম API কাজ করে)
        dom.window.fetch = fetch;

        // আপনার HTML এর কনসোল লগগুলো Render এর টার্মিনালে দেখার জন্য
        dom.window.console.log = (...args) => console.log("[BOT STATUS]:", ...args);
        dom.window.console.error = (...args) => console.error("[BOT ERROR]:", ...args);

        console.log("✅ Virtual Browser loaded successfully!");
        console.log("📡 HTML Bot is now running and sending Telegram messages...");

    } catch (error) {
        console.error("❌ Error starting Virtual Browser:", error);
    }
}
