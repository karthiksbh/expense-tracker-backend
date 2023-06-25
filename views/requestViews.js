const PaymentRequest = require('../models/PaymentRequest');
const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');

const authenticateAndRetrieveUser = (req) => {
    const token = req.headers.authorization;
    if (!token || !token.startsWith('Bearer ')) {
        throw new Error('No credentials found');
    }
    const tokenWithoutBearer = token.split(' ')[1];
    try {
        const decodedToken = jwt.verify(tokenWithoutBearer, process.env.SECRET);
        return { _id: decodedToken.userId };
    } catch (error) {
        throw new Error('Invalid token');
    }
};


const requestPayment = async (req, res) => {
    try {
        const { email, amount, title } = req.body;
        const requestingUser = authenticateAndRetrieveUser(req);
        const payUser = await User.findOne({ email });

        if (!payUser) {
            return res.status(404).json({ error: 'User not found. Please check the user email and try again.' });
        }

        if (payUser._id == requestingUser._id) {
            return res.status(404).json({ error: 'Cannot initiate payment request for the same user.' });
        }

        const paymentRequest = new PaymentRequest({
            title,
            requestUser: requestingUser,
            payUser: payUser._id,
            amount
        });

        await paymentRequest.save();

        res.status(201).json({ message: 'Payment request created successfully.', paymentRequest });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// View all the requests that the logged in user received
const receivedRequests = async (req, res) => {
    try {
        const payUser = authenticateAndRetrieveUser(req);
        const requests = await PaymentRequest.find({ payUser }).populate('payUser', 'email');
        res.status(200).json({ requests });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


// Function where you have sent requests
const myRequests = async (req, res) => {
    try {
        const requestUser = authenticateAndRetrieveUser(req);
        const requests = await PaymentRequest.find({ requestUser }).populate('payUser', 'email');

        res.status(200).json({ requests });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const changeStatus = async (req, res) => {
    try {
        const loggedInUser = authenticateAndRetrieveUser(req);
        if (!loggedInUser) {
            return res.status(401).json({ 'error': 'Not logged in' });
        }
        const { id } = req.params;
        const request = await PaymentRequest.findById(id);
        if (!request) {
            return res.status(404).json({ error: 'Payment request not found' });
        }
        request.payStatus = !request.payStatus;
        await request.save();

        return res.json(request);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error });
    }
}

const deleteStatus = async (req, res) => {
    const loggedInUser = authenticateAndRetrieveUser(req);
    if (!loggedInUser) {
        return res.status(401).json({ 'error': 'Not logged in' });
    }
    const { id } = req.params;
    try {
        const request = await PaymentRequest.findById(id);
        if (!request) {
            return res.status(404).json({ error: 'Payment request not found' });
        }
        return res.json({ message: 'Payment request deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
}

const sendRemindMail = async (req, res) => {
    var loggedInUser = authenticateAndRetrieveUser(req);
    if (!loggedInUser) {
        return res.status(401).json({ 'error': 'Not logged in' });
    }
    loggedInUser = await User.findById(loggedInUser._id);
    const { id } = req.params;
    try {
        const request = await PaymentRequest.findById(id);
        if (!request) {
            return res.status(404).json({ error: 'Payment request not found' });
        }
        const userInfo = await User.findById(request.payUser._id);
        const sendUser = loggedInUser.firstName + " " + loggedInUser.lastName;
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });

        var mailOptions = {
            from: process.env.EMAIL,
            to: userInfo.email,
            subject: 'Payment Reminder Mail',
            html: `
            <!DOCTYPE html>
            <html>
              <head>
                <title>Reminder Email</title>
              </head>
              <body>
                <h1>Payment Reminder Mail</h1>
                <p>
                  This is a reminder mail sent by <strong>${sendUser}</strong> to remind you to pay the pending ₹${request.amount}.
                </p>
                <p>Thank you!</p>
              </body>
            </html>
            `
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        }
        );
        return res.json({ message: 'Reminder Mail sent successfully!!' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }

}


const sendPaidMail = async (req, res) => {
    var loggedInUser = authenticateAndRetrieveUser(req);
    if (!loggedInUser) {
        return res.status(401).json({ 'error': 'Not logged in' });
    }
    loggedInUser = await User.findById(loggedInUser._id);
    const { id } = req.params;
    try {
        const request = await PaymentRequest.findById(id);
        if (!request) {
            return res.status(404).json({ error: 'Payment request not found' });
        }
        const userInfo = await User.findById(request.requestUser._id);
        const sendUser = loggedInUser.firstName + " " + loggedInUser.lastName;
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });

        var mailOptions = {
            from: process.env.EMAIL,
            to: userInfo.email,
            subject: 'Payment Confirmation Mail',
            html: `
                <!DOCTYPE html>
                <html>
                  <head>
                    <title>Confirmation Email</title>
                  </head>
                  <body>
                    <h1>Payment Confirmation Mail</h1>
                    <p>
                      This is a mail sent to inform that ${sendUser}</strong> has paid the pending amount of ₹${request.amount}.Please check it and let them know if not received.
                    </p>
                    <p>Thank you!</p>
                  </body>
                </html>
                `
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        }
        );
        return res.json({ message: 'Payment Mail sent successfully!!' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }

}
module.exports = { requestPayment, receivedRequests, myRequests, changeStatus, deleteStatus, sendRemindMail,sendPaidMail};