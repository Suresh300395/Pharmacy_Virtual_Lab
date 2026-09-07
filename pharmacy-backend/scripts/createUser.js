const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

dotenv.config();

const createUser = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas successfully.');

    const email = 'student@adityauniversity.in';
    const rawPassword = 'Aditya@123';

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      user.password = hashedPassword;
      await user.save();
      console.log(`User ${email} already existed. Password updated successfully.`);
    } else {
      user = await User.create({
        email,
        password: hashedPassword,
        role: 'student',
      });
      console.log(`User created successfully:\nID: ${user._id}\nEmail: ${user.email}\nRole: ${user.role}`);
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('Error creating user:', error);
    process.exit(1);
  }
};

createUser();
