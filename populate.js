import { config } from 'dotenv';
import Job from './models/Job.js';
import connectDB from './db/connect.js';
import { readFile } from 'fs/promises';

const mockData = JSON.parse(
    await readFile(new URL('./MOCK_DATA.json', import.meta.url), 'utf-8')
);
config();

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        await Job.create(mockData);
        console.log('Successfully Updated Job');
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

start();