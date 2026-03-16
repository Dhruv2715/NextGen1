const cron = require('node-cron');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const { sendEmail } = require('./emailService');

const initNotificationScheduler = () => {
    // Run every day at 10:00 AM
    cron.schedule('0 10 * * *', async () => {
        console.log('Running daily interview reminders cron job...');
        
        try {
            // 1. Find apps approved but interview not started within 24h
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            
            // approved status means they've been cleared but might not have started
            const approvedApps = await Application.find({
                status: 'approved',
                created_at: { $lt: oneDayAgo },
                stage: { $ne: 'Offer' } // Nudge only if still in process
            }).populate('candidate_id', 'name email notificationPreferences');

            for (const app of approvedApps) {
                // Check if they've started an interview already
                const interview = await Interview.findOne({ 
                    candidate_id: app.candidate_id._id,
                    job_id: app.job_id
                });

                // Nudge if interview doesn't exist or is still in 'scheduled' (not yet completed/started significantly)
                if (!interview || interview.status === 'scheduled') {
                    // Check user preference
                    if (app.candidate_id?.notificationPreferences?.emailReminders !== false) {
                        try {
                            await sendEmail({
                                email: app.candidate_id.email,
                                subject: "Don't forget: Your technical assessment is waiting",
                                html: `
                                    <div style="font-family: sans-serif; padding: 20px;">
                                        <h2>Ready to shine, ${app.candidate_id.name}?</h2>
                                        <p>We noticed you haven't started your technical assessment for the role yet.</p>
                                        <p>Practicing today increases your chances of landong the role. Head over to the portal to start whenever you are ready!</p>
                                        <div style="margin-top: 20px;">
                                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/candidate/dashboard" 
                                               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                                               Go to Dashboard
                                            </a>
                                        </div>
                                    </div>
                                `
                            });
                        } catch (err) {
                            console.error(`Failed to send reminder to ${app.candidate_id.email}:`, err);
                        }
                    }
                }
            }

            console.log(`Sent reminders to pending candidates.`);
        } catch (error) {
            console.error('Error in notification scheduler:', error);
        }
    });
};

module.exports = { initNotificationScheduler };
