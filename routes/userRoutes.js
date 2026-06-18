const express = require('express');
const router = express.Router();
const multer = require('multer'); // image uplaod 
const path = require('path');

// 💡 লারাভেলের auth মিডলওয়্যারের হুবহু সমান নোড জেএস নিয়ম:
const checkSession = (req, res, next) => {
    // যদি সেশন আইডি বা অ্যাডমিনের ডেটা ফাকা (null / undefined) হয়
    if (!req.session || !req.session.admin) {
        // লারাভেলের return redirect('/login') এর মতো
        return res.redirect('/admin/login'); 
    }
    
    // আর সেশন যদি থাকে, তবে next() কল করার মাধ্যমে তাকে ওই ইউআরএল বা পেজে যেতে দেবে
    next();
};


// কন্ট্রোলারটি ইমপোর্ট করুন
const userController = require('../controllers/userController');


// 💡 ১. মাল্টার স্টোরেজ কনফিগারেশন (ফাইল নাম ইউনিক করার জন্য)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // কোন ফোল্ডারে সেভ হবে
    },
    filename: function (req, file, cb) {
        // ফাইলের আসল নামের সাথে বর্তমান সময় যোগ করে ইউনিক নাম বানানো (লারাভেলের time().'.'.$ext এর মতো)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });




// লারাভেলের Route::get('/users', [UserController::class, 'getAllUsers']); এর মতো
router.get('/users', userController.showUsersPage);
router.get('/login', userController.login);
router.post('/login-add', userController.login_add);
router.get('/logout', checkSession, userController.logout);



router.get('/createusers', checkSession,userController.create_user);
//router.post('/store-user', userController.storeUser); without image save only data save

// 💡 ২. রাউটে মিডলওয়্যার হিসেবে upload.single('profile_image') যোগ করুন
// 'profile_image' হলো আপনার এইচটিএমএল ফর্মের ইনপুট ফিল্ডের name
router.post('/store-user', upload.single('profile_image'), checkSession,userController.storeUser);

router.get('/delete-user/:id', checkSession, userController.deleteUser);

router.get('/edit-user/:id', checkSession, userController.editUser);

//router.post('/update-user', userController.updateUser); without image only data update

router.post('/update-user', upload.single('profile_image'), checkSession, userController.updateUser);

module.exports = router;