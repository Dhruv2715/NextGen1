const fs = require('fs');
const path = require('path');

const filesToDelete = [
    'config/pgDb.js',
    'models/pgUser.js',
    'models/pgJob.js',
    'models/pgInterview.js',
    'models/pgTranscript.js',
    'check_db.js',
    'check_pg.js'
];

filesToDelete.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            console.log(`Deleted: ${file}`);
        } catch (err) {
            console.error(`Error deleting ${file}:`, err.message);
        }
    } else {
        console.log(`File not found: ${file}`);
    }
});
