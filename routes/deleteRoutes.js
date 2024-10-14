const express = require('express');
const router = express.Router();
const User = require('./../models/user');  

router.delete('/:id', async (req, res) => {
    const id = req.params.id.trim(); 

    try {
        
        const user = await User.findById(id);
        
        if (!user) {
            return res.status(404).send('Resource not found.');
        }
        console.log(`Deleting user: ${user.name} (ID: ${id})`);

        await User.findByIdAndDelete(id);
        res.status(200).send(`Resource with id ${id} (Name: ${user.name}) deleted.`);
    } catch (err) {
        res.status(500).send('Error deleting resource: ' + err.message);
    }
});

///// http://localhost:3000/user/66f1396e8246479058dcac7a  //


module.exports = router;
