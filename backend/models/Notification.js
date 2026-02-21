const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
    {
        recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        message: { type: String, required: true },
        type: { type: String, enum: ['info', 'alert', 'success'], default: 'info' },
        is_read: { type: Boolean, default: false },
        link: { type: String }, // Optional link to redirect user
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

module.exports = mongoose.model("Notification", NotificationSchema);
