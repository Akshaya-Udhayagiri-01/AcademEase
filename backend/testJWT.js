const jwt = require("jsonwebtoken");

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZDQ5OTcxYjhhYTlkNjhlYzljOTE5MCIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNzQyMDY2MjU0LCJleHAiOjE3NDI2NzEwNTR9.GNYhCvvBOOpeKBK_E_yQOCSxtm4lWPQoDa7QlX_9vO"; // Replace with your token
const secret = process.env.JWT_SECRET || "8c40451a3b791c6ec495072081f255db755fdea04c95b95fc198dc85286455cf"; // Use the actual secret

try {
    const decoded = jwt.verify(token, secret);
    console.log("✅ Token is valid:", decoded);
} catch (err) {
    console.log("❌ Token verification failed:", err.message);
}
