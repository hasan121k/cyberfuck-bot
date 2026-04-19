const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// আপনার অরিজিনাল index.html ফাইলটি রান করবে
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// সার্ভার সজাগ রাখার পেজ
app.get('/ping', (req, res) => {
    res.send('Server is awake and running 24/7!');
});

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    
    try {
        const browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-background-timer-throttling', // ব্যাকগ্রাউন্ডে টাইমার ঘুমানো বন্ধ করবে
                '--disable-backgrounding-occluded-windows', // স্ক্রিপ্ট সচল রাখবে
                '--disable-renderer-backgrounding' // পেজ সবসময় লাইভ রাখবে
            ]
        });
        
        const page = await browser.newPage();

        // ⚠️ আপনার সাইটের ভেতরের লগগুলো Render এর টার্মিনালে দেখাবে
        page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
        page.on('pageerror', error => console.error('BROWSER ERROR:', error.message));

        await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle2' });
        console.log("✅ অদৃশ্য ব্রাউজার সফলভাবে ওপেন হয়েছে এবং Sleep Mode বন্ধ করা হয়েছে!");

        // প্রতি ৫ মিনিট পরপর ব্রাউজারের ভেতর একটি ফেক ক্লিক করবে (যাতে ব্রাউজার ভাবে কোনো মানুষ বসে আছে)
        setInterval(async () => {
            try {
                await page.evaluate(() => document.body.click());
            } catch (e) {}
        }, 300000);

    } catch (error) {
        console.error("Browser launch error:", error);
    }
});
