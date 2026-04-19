const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/ping', (req, res) => {
    res.send('Server is awake!');
});

let browser;

async function startBrowser() {
    try {
        console.log("Starting invisible browser...");
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding'
            ]
        });
        
        const page = await browser.newPage();
        
        await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle2' });
        console.log("✅ ব্রাউজার সফলভাবে চালু হয়েছে। সিগন্যাল যাচ্ছে!");

        browser.on('disconnected', () => {
            console.log("⚠️ ব্রাউজার ক্র্যাশ করেছে! ৫ সেকেন্ড পর রিস্টার্ট হচ্ছে...");
            setTimeout(startBrowser, 5000);
        });

        setInterval(async () => {
            try { await page.evaluate(() => document.body.click()); } catch (e) {}
        }, 60000);

    } catch (error) {
        console.error("Browser error:", error.message);
        setTimeout(startBrowser, 10000); 
    }
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    startBrowser();
    setInterval(() => {
        http.get(`http://localhost:${PORT}/ping`).on('error', () => {});
    }, 300000);
});
