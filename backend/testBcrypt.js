const bcrypt = require("bcryptjs");

const hashedPassword = bcrypt.hashSync("admin123", 10);
console.log("Hashed Password:", hashedPassword);
