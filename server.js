const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;

// আপনার অরিজিনাল index.html ফাইলটি রান করবে
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// সার্ভার সজাগ রাখার পেজ
app.get('/ping', (req, res) => {
    res.send('Server is awake!');
});

let browser;

// ব্রাউজার চালানোর ফাংশন (যাতে ক্র্যাশ করলে আবার চালানো যায়)
async function startBrowser() {
    try {
        console.log("Starting invisible browser...");
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--no-zygote',
                '--single-process', // র‍্যাম অনেক কম খাবে
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding'
            ]
        });
        
        const page = await browser.newPage();

        await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle2' });
        console.log("✅ ব্রাউজার সফলভাবে চালু হয়েছে। সিগন্যাল যাচ্ছে!");

        // ⚠️ যদি র‍্যাম ফুল হওয়ার কারণে ব্রাউজার অফ হয়ে যায়, তবে অটোমেটিক রিস্টার্ট হবে!
        browser.on('disconnected', () => {
            console.log("⚠️ ব্রাউজার ক্র্যাশ করেছে! ৫ সেকেন্ড পর অটো রিস্টার্ট হচ্ছে...");
            setTimeout(startBrowser, 5000);
        });

        // ব্রাউজারকে সজাগ রাখতে প্রতি ১ মিনিট পর পর একটি ফেক ক্লিক
        setInterval(async () => {
            try {
                await page.evaluate(() => document.body.click());
            } catch (e) {}
        }, 60000);

    } catch (error) {
        console.error("Browser error:", error);
        setTimeout(startBrowser, 10000); // এরর হলে ১০ সেকেন্ড পর আবার চেষ্টা করবে
    }
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    
    // ব্রাউজার স্টার্ট করা
    startBrowser();

    // সার্ভার যেন না ঘুমায় তাই প্রতি ৫ মিনিট পর পর নিজেকে নিজে নক (Ping) করবে
    setInterval(() => {
        http.get(`http://localhost:${PORT}/ping`);
    }, 300000);
});
