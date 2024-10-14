const express = require('express');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./../models/user') 
const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only .jpeg, .jpg, and .png files are allowed!'));
        }
    }
});

router.put('/update-profile-image/:id', upload.single('profileImage'), async (req, res) => {
    const userId = req.params.id.trim(); 

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format.' });
    }

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const profileImageUrl = `/uploads/${req.file.filename}`;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profileImage: profileImageUrl },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found!' });
        }

        res.status(200).json({
            message: 'Profile image updated successfully!',
            user: updatedUser,
            profileImage: profileImageUrl
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

////  http://localhost:3000/user/update-profile-image/66f162ea40aa7b51e1b59a7a  //

module.exports = router;
