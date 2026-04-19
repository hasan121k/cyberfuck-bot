const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// আপনার অরিজিনাল index.html ফাইলটি রান করবে (কোনো চেঞ্জ ছাড়া)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// সার্ভারকে ঘুম থেকে জাগিয়ে রাখার জন্য একটি লিংক
app.get('/ping', (req, res) => {
    res.send('Server is awake and running 24/7!');
});

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    
    try {
        // সার্ভারের ভেতর অটোমেটিক ব্রাউজার ওপেন হবে
        const browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        });
        
        const page = await browser.newPage();
        // আপনার লোকাল সাইট ব্রাউজারে ওপেন করে রাখবে
        await page.goto(`http://localhost:${PORT}/`);
        console.log("✅ অদৃশ্য ব্রাউজার ওপেন হয়েছে। এখন ২৪/৭ টেলিগ্রাম সিগন্যাল চলবে!");
    } catch (error) {
        console.error("Browser launch error:", error);
    }
});
