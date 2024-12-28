import pkg from 'mongoose';
const { connect } = pkg;

const connectDB = (url) => {
  return connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true, // Recommended to use the new topology engine
  });
}

export default connectDB;