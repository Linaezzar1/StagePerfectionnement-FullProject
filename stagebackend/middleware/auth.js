const jwt = require('jsonwebtoken');


module.exports = (req, res,next)=> {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided.' });
    }

    const token = authHeader.replace('Bearer ' , '');

    try {
        const verified = jwt.verify(token, "123456789");
        req.user = verified;
        next();
    } catch (error) {
        return res.status(400).send({ message: 'Token is not valid' + error });
    }
}
