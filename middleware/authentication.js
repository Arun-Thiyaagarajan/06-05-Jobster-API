// import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import UnauthenticatedError from '../errors/unauthenticated.js';

const auth = async (req, res, next) => { 
    // check header
    const authHeader = req.headers.authorization;
    if (!authHeader ||!authHeader.startsWith('Bearer ')) {
        throw new UnauthenticatedError('Authentication invalid');
    }
    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const testUser = payload.userId === '676ec42616bba92abb7996cc';
        // attach the user to the job routes
        req.user = {userId: payload.userId, testUser};
        next();
    } catch (error) {
        throw new UnauthenticatedError('Authentication invalid');
    }
}

export default auth;