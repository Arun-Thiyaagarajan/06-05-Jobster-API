import { Router } from 'express';
import { getAllJobs, getJob, createJob, updateJob, deleteJob, showStats } from '../controllers/jobs.js'
import testUser from '../middleware/testUser.js';

const router = new Router();

router.route('/').post(testUser, createJob).get(getAllJobs);
router.route('/stats').get(showStats);
router.route('/:id').get(getJob).delete(testUser, deleteJob).patch(testUser, updateJob);

export default router;
