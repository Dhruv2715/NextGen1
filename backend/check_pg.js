try {
    require('pg');
    console.log('SUCCESS: pg module found');
} catch (e) {
    console.error('ERROR: pg module not found');
    console.error(e.message);
    process.exit(1);
}
