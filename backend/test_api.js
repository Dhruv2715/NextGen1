const axios = require('axios');

async function testSignup() {
    console.log("Attempting to register user via http://localhost:5000/api/auth/register...");
    try {
        const res = await axios.post('http://localhost:5000/api/auth/register', {
            name: "Test User",
            email: "testuser_" + Date.now() + "@example.com",
            password: "password123",
            role: "candidate"
        });
        console.log("SUCCESS! Status:", res.status);
        console.log("Data:", res.data);
    } catch (err) {
        console.error("FAILURE!");
        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Data:", err.response.data);
        } else if (err.request) {
            console.error("No response received (Server down or timeout)");
        } else {
            console.error("Error:", err.message);
        }
    }
}

testSignup();
