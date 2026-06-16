const express = require('express');
const app = express();
const PORT = 5000;
const session = require('express-session');
const flash = require('express-flash');

// ১. তৈরি করা রাউট ফাইলটি ইমপোর্ট করুন
const userRoutes = require('./routes/userRoutes');

const path = require('path');

// এক্সপ্রেসকে ভিউ ইঞ্জিন হিসেবে EJS সেট করা
app.set('view engine', 'ejs');
// এক্সপ্রেসকে বলে দেওয়া যে 'views' ফোল্ডারটি রুট ডিরেক্টরিতে আছে (লারাভেলের resources/views এর মতো)
app.set('views', path.join(__dirname, 'views'));

// এক্সপ্রেসকে বলে দেওয়া যে uploads ফোল্ডারের ফাইলগুলো সরাসরি ইউআরএল দিয়ে দেখা যাবে
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// মিডলওয়্যার হিসেবে জেডিএসওন (JSON) সাপোর্ট অন করুন (লারাভেলের API মিডলওয়্যারের মতো)
app.use(express.json());

// ১. সেশন মিডলওয়্যার কনফিগারেশন (লারাভেলের session.php এর মতো)
app.use(session({
    secret: 'mysecretkey', // যেকোনো একটি সিক্রেট নাম দিন
    resave: false,
    saveUninitialized: true
}));

// ২. ফ্ল্যাশ মেসেজ মিডলওয়্যার অন করা
app.use(flash());





// 💡 নোড জেএস নিয়ম: HTML Form এর ডেটা ব্যাক-এন্ডে রিড করার জন্য এটি অবশ্যই লাগবে
app.use(express.urlencoded({ extended: true }));

// ২. রাউটটি অ্যাপে যুক্ত করুন (লারাভেলের 'api' প্রিফিক্সের মতো)
app.use('/api', userRoutes);

app.listen(PORT, () => {
    console.log(`Server is running successfully on port ${PORT}`);
});