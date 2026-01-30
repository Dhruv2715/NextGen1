const mongoose = require('mongoose');
require('dotenv').config();
const Interview = require('./models/Interview');
const Job = require('./models/Job');

async function checkInterview() {
    console.log('Script started...');
    try {
        console.log('Connecting to:', process.env.MONGO_URI?.substring(0, 20) + '...');
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
        console.log('Connected to DB successfully');

        const interviewId = '697ba0154b5dfe75eb2edb8e';
        console.log('Searching for interview:', interviewId);

        const interview = await Interview.findById(interviewId).populate('job_id');
        if (!interview) {
            console.log('Interview NOT found in DB');
            const all = await Interview.find().limit(5);
            console.log('Sample interview IDs in DB:', all.map(a => a._id));
            return;
        }

        console.log('Interview found:');
        console.log('Status:', interview.status);
        console.log('Job ID:', interview.job_id?._id || interview.job_id);

    } catch (err) {
        console.error('SCRIPT ERROR:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
        process.exit(0);
    }
}

checkInterview();
