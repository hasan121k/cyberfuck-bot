const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// আপনার ফোল্ডারের ফাইলগুলো (index.html) হোস্ট করার জন্য
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// সার্ভার চালু করা এবং Puppeteer দিয়ে HTML ব্যাকগ্রাউন্ডে ওপেন করা
app.listen(PORT, async () => {
    console.log(`✅ Web server running on port ${PORT}`);

    try {
        console.log("🚀 Starting background Browser (Puppeteer)...");
        
        const browser = await puppeteer.launch({
            headless: true, // ব্রাউজার হাইড করে চালাবে
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        });
        
        const page = await browser.newPage();
        
        // আপনার HTML পেজটি ব্রাউজারে ওপেন হচ্ছে
        await page.goto(`http://localhost:${PORT}`);
        
        console.log("✅ Your HTML Bot is now running 24/7 in the background!");
        console.log("📡 It will fetch data from Firebase and send Telegram messages automatically.");
        
    } catch (error) {
        console.error("❌ Puppeteer error:", error);
    }
});
