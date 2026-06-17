const express = require('express');
const router = express.Router();
const multer = require('multer'); // image uplaod 
const path = require('path');

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

router.get('/createusers', userController.create_user);
//router.post('/store-user', userController.storeUser); without image save only data save

// 💡 ২. রাউটে মিডলওয়্যার হিসেবে upload.single('profile_image') যোগ করুন
// 'profile_image' হলো আপনার এইচটিএমএল ফর্মের ইনপুট ফিল্ডের name
router.post('/store-user', upload.single('profile_image'), userController.storeUser);

router.get('/delete-user/:id', userController.deleteUser);

router.get('/edit-user/:id', userController.editUser);

//router.post('/update-user', userController.updateUser); without image only data update

router.post('/update-user', upload.single('profile_image'), userController.updateUser);

module.exports = router;