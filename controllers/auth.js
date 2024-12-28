import { StatusCodes } from 'http-status-codes';
import User from '../models/User.js';
import UnauthenticatedError from '../errors/unauthenticated.js';
import BadRequestError from '../errors/bad-request.js';

const register = async (req, res) => {
    const user = await User.create({ ...req.body });
    const token = user.createJWT();  // Generate JWT token for the new user.
    res.status(StatusCodes.CREATED).json({
        user: {
            email: user.email,
            lastName: user.lastName,
            location: user.location,
            name: user.name,
            token,
        },
    });
}
const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw new UnauthenticatedError('Invalid Credentials');
    }
    // compare password
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        throw new UnauthenticatedError('Invalid Credentials');
    }

    const token = user.createJWT();
    res.status(StatusCodes.OK).json({
        user: {
            email: user.email,
            lastName: user.lastName,
            location: user.location,
            name: user.name,
            token,
        },
    });
}

const updateUser = async (req, res) => { 
    const { name, email, lastName, location } = req.body;

    if (!name || !email || !lastName || !location) {
        throw new BadRequestError('Please provide all required fields');
    }

    const user = await User.findOne({ _id: req.user.userId });
    user.email = email;
    user.name = name;
    user.lastName = lastName;
    user.location = location;
    await user.save();

    const token = user.createJWT();
    res.status(StatusCodes.OK).json({
        user: {
            email: user.email,
            lastName: user.lastName,
            location: user.location,
            name: user.name,
            token,
        },
    });
}

export {
    register,
    login,
    updateUser,
}