// লারাভেলের public function index() এর মতো
const db = require('../config/db');
const fs = require('fs'); // image file delete 
const path = require('path');
const showUsersPage = async (req, res) => {
    try {
        // ১. MySQL থেকে সব ডেটা সিলেক্ট করা (লারাভেলের DB::select এর মতো)
        // [rows] এর ভেতর ডাটাবেসের সব রেকর্ড চলে আসবে
        const [rows] = await db.query('SELECT * FROM employees');

        // ২. লারাভেলের return view('users', compact('users')) এর মতো নোড জেএস এর নিয়ম
        res.render('users', { users: rows });
        
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching data from MySQL database");
    }
};

const create_user = async(req,res)=>
{
const[rows]=await db.query('Select * from employees');
res.render('employe', { users: rows });

};



// 💡 ৩. নতুন ফাংশন: ডাটাবেসে ডেটা ইনসার্ট করার জন্য (লারাভেলের store মেথডের মতো)
const storeUser = async (req, res) => {
    try {
        // লারাভেলের $request->input('name') এর বদলে নোড জেএস এ req.body ব্যবহার করা হয়
        // ফরমের ভেতরের input field এর 'name' অ্যাট্রিবিউটের সাথে এই নামগুলো মিলতে হবে
        const { name, email, department } = req.body;

         // 💡 যদি ইউজার ছবি আপলোড করে, তবে ফাইলের ইউনিক নামটা ধরবে, না করলে ফাকা থাকবে
        const imageName = req.file ? req.file.filename : null;

        const [rows] = await db.query('SELECT * FROM employees WHERE email = ?', [email]);
        if(rows.length>0)
        {
             req.flash('delsuccess', 'This email is already registered!'); // লারাভেলের back()->withErrors() এর মতো
            return res.redirect('/api/createusers');
        }
        

        // MySQL এ ডেটা ইনসার্ট করার জন্য SQL Query (Prepared Statement ব্যবহার করা হয়েছে সিকিউরিটির জন্য)
        const sql = 'INSERT INTO employees (name, email, department, image) VALUES (?, ?, ?, ?)';
        
        // কুয়েরি এক্সিকিউট করা
        await db.query(sql, [name, email, department, imageName]);

        // 💡 লারাভেলের return redirect()->route(...) এর মতো নোড জেএস এ রিডাইরেক্ট করার নিয়ম:
        // ডেটা সেভ হওয়ার পর ইউজার অটোমেটিক আবার লিস্ট পেজে চলে যাবে
        req.flash('success', 'Employee Add successfully!');
        res.redirect('/api/createusers'); 

    } catch (error) {
        console.error(error);
        res.status(500).send("Error inserting data into MySQL database");
    }
};

const deleteUser = async (req, res) => {
    try {
        // ইউআরএল থেকে আইডি ধরা (লারাভেলের $id এর মতো, এখানে req.params.id)
        const userId = req.params.id;

        // 💡 লারাভেলের echo বা Log::info এর মতো নোড জেএস নিয়ম:
    
    //console.log("The incoming User ID is:", userId);
    
     // 💡 লারাভেলের dd($userId) এর হুবহু সমান নোড জেএস নিয়ম:
    //return res.send(`Stopped here! ID received from URL is: ${userId}`);

        // safe query দিয়ে ডিলিট করা
        const sql = 'DELETE FROM employees WHERE id = ?';
        await db.query(sql, [userId]);

        // ডিলিট হওয়ার পর আবার লিস্ট পেজে রিডাইরেক্ট
        req.flash('delsuccess', 'Employee Delete successfully!');
        res.redirect('/api/createusers');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting user");
    }
};

const editUser = async(req,res)=>{
const userId = req.params.id;
//return res.send(userId);
try{
const [rows] = await db.query('SELECT * FROM employees WHERE id = ?', [userId]);
// 💡 সংশোধন ২: পুরো rows না পাঠিয়ে ১ম কর্মচারীর অবজেক্টটি (rows[0]) পাঠানো হলো
        // ভ্যারিয়েবলের নাম 'user' রাখা হলো যাতে এডিট পেজে লিখতে সুবিধা হয়
return res.render('employe_edit',{user: rows[0]});
} catch(error)
{
 console.error(error);
 res.status(500).send("Error fetching data from MySQL database");
}

};


const updateUser = async(req,res)=>{
    try{
const {name, email, department, employe_id } = req.body;


 // ১. ডাটাবেস থেকে ওই কর্মচারীর পুরোনো ইমেজের নামটা প্রথমে তুলে আনা
        const [currentEmployee] = await db.query('SELECT image FROM employees WHERE id = ?', [employe_id]);
        const oldImageName = currentEmployee[0] ? currentEmployee[0].image : null;

        let finalImageName = oldImageName; // বাই-ডিফল্ট পুরোনো ইমেজের নামটাই থাকবে

        // ২. ইউজার যদি এডিট ফর্মে নতুন কোনো ছবি আপলোড করে (লারাভেলের $request->hasFile এর মতো)
        if (req.file) {
            finalImageName = req.file.filename; // নতুন ইমেজের নাম সেট হলো

            // 💡 যদি আগে থেকেই ডাটাবেসে কোনো পুরোনো ছবি সেভ থাকে, তবে সেটি সার্ভার থেকে ডিলিট করার নোড জেএস নিয়ম:
            if (oldImageName) {
                const oldImagePath = path.join(__dirname, '../uploads/', oldImageName);
                
                // fs.existsSync চেক করে ফাইলটি আসলেই ফোল্ডারে আছে কি না, থাকলে ডিলিট (unlink) করবে
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath); // লারাভেলের Storage::delete() এর মতো কাজ করবে
                }
            }
        }






const sql = 'UPDATE employees SET name = ?, email = ?, department = ?, image = ? WHERE id = ?'; 
// কুয়েরি এক্সিকিউট করা
await db.query(sql, [name, email, department, finalImageName, employe_id]);
 // 💡 লারাভেলের ->with('success', '...') এর মতো নোড জেএস নিয়ম:
req.flash('success', 'Employee updated successfully!');

res.redirect('/api/createusers');
    } catch(error)
    {
      console.error(error);
    res.status(500).send("Error fetching data from MySQL database");  
    }
};



// ফাংশনটি এক্সপোর্ট করুন যাতে রাউট ফাইলে ব্যবহার করা যায়
module.exports = {
    showUsersPage,create_user,storeUser,deleteUser,editUser,updateUser
};


