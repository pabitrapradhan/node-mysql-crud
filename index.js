require('dotenv').config();
const db = require('./config/db'); 
const express = require('express');
const app = express();

// ❌ ভুল: PORT = 5000; 
//  সঠিক: লাইভ সার্ভারের পোর্ট সাপোর্ট যোগ করা হলো
const PORT = process.env.PORT || 5000;

const session = require('express-session');
const flash = require('express-flash');
const path = require('path');

// ১. তৈরি করা রাউট ফাইলটি ইমপোর্ট করুন
const userRoutes = require('./routes/userRoutes');

// এক্সপ্রেসকে ভিউ ইঞ্জিন হিসেবে EJS সেট করা
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// এক্সপ্রেসকে বলে দেওয়া যে uploads ফোল্ডারের ফাইলগুলো সরাসরি ইউআরএল দিয়ে দেখা যাবে
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// মিডলওয়্যার হিসেবে জেডিএসওন (JSON) সাপোর্ট অন করুন
app.use(express.json());

// 💡 HTML Form এর ডেটা ব্যাক-এন্ডে রিড করার জন্য এটি অবশ্যই লাগবে
app.use(express.urlencoded({ extended: true }));

// ১. সেশন মিডলওয়্যার কনফিগারেশন
app.use(session({
    secret: 'mysecretkey', 
    resave: false,
    saveUninitialized: true
}));

// ২. ফ্ল্যাশ মেসেজ মিডলওয়্যার অন করা
app.use(flash());

// 💡 লারাভেলের গ্লোবাল সেশন শেয়ারিং এর হুবহু সমান নোড জেএস নিয়ম:
app.use((req, res, next) => {
    res.locals.session = req.session; 
    next();
});

// 🚀 [ম্যাজিক ফিক্স]: রিক্রুটার বা ভিজিটর সরাসরি লিংকে ক্লিক করলে যাতে ব্ল্যাঙ্ক পেজ না আসে
app.get('/', (req, res) => {
    res.redirect('/admin/users'); // এটি ভিজিটরকে সরাসরি আপনার ইউজার বা এমপ্লয়ি পেজে নিয়ে যাবে
});

// ২. রাউটটি অ্যাপে যুক্ত করুন
app.use('/admin', userRoutes);

app.listen(PORT, () => {
    console.log(`Server is running successfully on port ${PORT}`);
});