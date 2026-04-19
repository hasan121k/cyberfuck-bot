const {join} = require('path');

module.exports = {
  // Chrome ব্রাউজারটিকে গ্লোবাল ফাইলের বদলে সরাসরি আপনার প্রজেক্ট ফোল্ডারে ইন্সটল করবে
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
