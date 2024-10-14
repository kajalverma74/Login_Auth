const express = require('express');
const router = express.Router();
const User = require('./../models/user')
const bcrypt = require('bcryptjs');
const {jwtAuthMiddleware, generateToken} = require('./../jwt');

// Define routes here
router.get('/', (req, res) => {
    res.send('Welcome to the homepage!');
});

// Example signup route
router.post('/signup', async (req, res) =>{
    try{
        const data = req.body 

        const adminUser = await User.findOne({ role: 'admin' });
        if (data.role === 'admin' && adminUser) {
            return res.status(400).json({ error: 'Admin user already exists' });
        }
        if (!/^\d{12}$/.test(data.aadharCardNumber)) {
            return res.status(400).json({ error: 'Aadhar Card Number must be exactly 12 digits' });
        }
        const existingUser = await User.findOne({ aadharCardNumber: data.aadharCardNumber });
        if (existingUser) {
            return res.status(400).json({ error: 'User with the same Aadhar Card Number already exists' });
        }
        const newUser = new User(data);

        // Save the new user to the database
        const response = await newUser.save();
        console.log('data saved');

        const payload = {
            id: response.id, 
            username: response.name
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);

        res.status(200).json({
            message: 'Signup successful',
            response: response,
            token: token
        });
        
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})   ////////////   http://localhost:3000/user/signup ///


// Login Route

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ email }); 

       
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const payload = {
            id: user.id, 
        };
        const token = generateToken(payload);

        res.json({
            message: 'Login successful',
            token
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});   /////////// http://localhost:3000/user/login  ////



// Update Password Route
router.post('/updatePassword',jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; 
        const { currentPassword, newPassword } = req.body; 

      
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
        }

        const user = await User.findById(userId);

        if (!user || !(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ error: 'Invalid current password' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        console.log('Password updated');
        res.status(200).json({ 
            message: 'Password updated successfully', 
            id, 
            username 
          });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});            ////  http://localhost:3000/user/updatePassword  //



router.put('/updateProfile', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const updates = req.body;

        const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            message: 'Profile updated successfully',
            user
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});                    //// http://localhost:3000/user/updateProfile  //



router.get('/allUsers', async (req, res) => {
    try {
        
        const users = await User.find({});  
        if (!users || users.length === 0) {
            return res.status(404).json({ error: 'No users found' });
        }
        console.log(users);

        res.status(200).json({ users });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});   /////  http://localhost:3000/user/allUsers  //


router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try{
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId);

        // console.log(user);


        res.status(200).json({user});
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });   //// http://localhost:3000/user/profile ///
    }
})

module.exports = router;  
