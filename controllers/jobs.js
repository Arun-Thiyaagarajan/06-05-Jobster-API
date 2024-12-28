import { StatusCodes } from 'http-status-codes';
import Job from '../models/Job.js';
import Errors from '../errors/index.js';
import pkg from 'mongoose';
import moment from 'moment';

const { BadRequestError, NotFoundError } = Errors;

const getAllJobs = async (req, res) => {
    const { status, jobType, sort, search } = req.query;

    const queryObject = {
        createdBy: req.user.userId
    };

    if (search) {
        queryObject.position = {$regex: search, $options: 'i'};
    }

    if (status && status !== 'all') {
        queryObject.status = status;
    }

    if (jobType && jobType !== 'all') {
        queryObject.jobType = jobType;
    }

    let result = Job.find(queryObject);

    switch (sort) {
        case 'latest':
            result = result.sort('-createdAt')
            break;
    
        case 'oldest':
            result = result.sort('createdAt')
            break;
    
        case 'a-z':
            result = result.sort('position')
            break;
    
        case 'z-a':
            result = result.sort('-position')
            break;
    
        default:
            result = result.sort('createdAt')
            break;
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    result = result.skip(skip).limit(limit);

    const jobs = await result;

    const totalJobs = await Job.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalJobs / limit);

    res.status(StatusCodes.OK).json({ jobs, totalJobs, numOfPages });
}

const getJob = async (req, res) => {
    const {
        user: { userId },
        params: { id: jobId },
    } = req;

    const job = await Job.findOne({
        _id: jobId, createdBy: userId
    });

    if (!job) {
        throw new NotFoundError(`No job with id ${jobId}`);
    }

    res.status(StatusCodes.OK).json({ job });
}

const createJob = async (req, res) => {
    req.body.createdBy = req.user.userId;
    const job = await Job.create(req.body);
    res.status(StatusCodes.CREATED).json({ job });
}

const updateJob = async (req, res) => {
    const {
        body: { company, position },
        user: { userId },
        params: { id: jobId },
    } = req;

    if (!company || !position) {
        throw new BadRequestError('Please provide company and position');
    }

    const job = await Job.findByIdAndUpdate(
        { _id: jobId, createdBy: userId },
        req.body,
        { new: true, runValidators: true }
    );

    if (!job) {
        throw new NotFoundError(`No job with id ${jobId}`);
    }

    res.status(StatusCodes.OK).json({ job });
}

const deleteJob = async (req, res) => {
    const {
    user: { userId },
    params: { id: jobId },
    } = req;

    const job = await Job.findOneAndDelete({
        _id: jobId, createdBy: userId
    });
    
    if (!job) {
        throw new NotFoundError(`No job with id ${jobId}`);
    }

    res.status(StatusCodes.OK).send();
}

const showStats = async (req, res) => { 

    let stats = await Job.aggregate([
        { $match: { createdBy: pkg.Types.ObjectId(req.user.userId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    stats = stats.reduce((acc, curr) => {
        const { _id: title, count } = curr;
        acc[title] = count;
        return acc;
    }, {});

    const defaultStats = {
        pending: stats.pending || 0,
        interview: stats.interview || 0,
        declined: stats.declined || 0,
    };

    let monthlyApplications = await Job.aggregate([
        { $match: { createdBy: pkg.Types.ObjectId(req.user.userId) } },
        {
            $group: {
                _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 6 },
    ]);

    monthlyApplications = monthlyApplications.map(item => {
        const { _id: { year, month }, count } = item;
        const date = moment().month(month - 1).year(year).format('MMM Y');
        return { date, count };
    });

    console.log(monthlyApplications)

    res.status(StatusCodes.OK).json({
        defaultStats, monthlyApplications
    });
}

export {
    getAllJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob,
    showStats,
}
