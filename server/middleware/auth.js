const jwt = require("jsonwebtoken");
require('dotenv').config();

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY); 
    req.user = decoded;
    next(); 
  } catch (error) {
    return res.status(401).json({ error: "Invalid Token" });
  }
};

module.exports = verifyToken;
