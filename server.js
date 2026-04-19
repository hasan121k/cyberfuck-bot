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
    res.send('Server is running perfectly 24/7!');
});

let browser;

async function startBrowser() {
    try {
        console.log("Starting ULTRA-LIGHT background browser...");
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--no-zygote',
                '--mute-audio',
                '--disable-extensions',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding'
            ]
        });
        
        const page = await browser.newPage();

        // 🚀 RAM বাঁচানোর ম্যাজিক: ফন্ট, ছবি এবং সিএসএস ব্লক করে দেওয়া হলো!
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['stylesheet', 'font', 'image', 'media'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        // যেকোনো টাইমআউট এরর বন্ধ করা হলো
        page.setDefaultNavigationTimeout(0); 

        // পেজে কোনো এরর হলে লগ দেখাবে
        page.on('console', msg => console.log('BOT LOG:', msg.text()));

        console.log("Loading page in background...");
        // localhost এর বদলে 127.0.0.1 ব্যবহার করা হলো (Render এ বেশি স্ট্যাবল)
        await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'domcontentloaded' });
        
        console.log("✅ অদৃশ্য ব্রাউজার পারফেক্টলি চালু হয়েছে! এখন আপনি লিংক থেকে বের হলেও সারাদিন সিগন্যাল যাবে!");

        browser.on('disconnected', () => {
            console.log("⚠️ ব্রাউজার ডিসকানেক্ট হয়েছে! সাথে সাথে রিস্টার্ট হচ্ছে...");
            setTimeout(startBrowser, 3000);
        });

        // ব্রাউজারকে ১০০% সজাগ রাখতে প্রতি ২ মিনিট পরপর স্ক্রিপ্ট রান করানো
        setInterval(async () => {
            try { 
                await page.evaluate(() => console.log("Bot is alive and watching...")); 
            } catch (e) {}
        }, 120000);

    } catch (error) {
        console.error("Browser crash error:", error.message);
        setTimeout(startBrowser, 5000); 
    }
}

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    
    // সার্ভার পুরোপুরি চালু হওয়ার জন্য ৩ সেকেন্ড অপেক্ষা করে ব্রাউজার স্টার্ট করবে
    setTimeout(startBrowser, 3000);

    // Render-কে সজাগ রাখতে প্রতি ৫ মিনিট পরপর নক করা
    setInterval(() => {
        http.get(`http://127.0.0.1:${PORT}/ping`).on('error', () => {});
    }, 300000);
});
