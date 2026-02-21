const Notification = require("../models/Notification");

// @desc    Get all notifications for logged-in user
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ created_at: -1 })
            .limit(20);
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user.id },
            { is_read: true }
        );
        res.status(200).json({ message: "Marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { getMyNotifications, markAsRead };
