const jwt = require('jsonwebtoken');
const authenticateToken = (req, res, next)=>{
    const token= req.body.jwt;
    if(token == null) return res.redirect('/login');
    else {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user)=>{
        if(err) return res.redirect('/login');
        req.user = user;
        next();
        });
    }
}
module.exports = authenticateToken;