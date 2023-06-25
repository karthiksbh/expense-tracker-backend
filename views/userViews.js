const User = require('../models/UserModel');
const { RefreshToken } = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            email,
            password: hashedPassword,
            firstName,
            lastName
        });
        await newUser.save();
        res.status(201).json({ message: 'Created user' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'Invalid Credentials' });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ error: 'Password Incorrect' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.SECRET);
        res.status(200).json({
            firstName: user.firstName,
            lastName: user.lastName,
            access_token: token
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { registerUser, loginUser };