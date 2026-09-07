const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

dotenv.config();

const createAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas successfully.');

    const email = 'admin@adityauniversity.in';
    const rawPassword = 'Admin@123';

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    let user = await User.findOne({ email });

    if (user) {
      user.password = hashedPassword;
      user.role = 'admin';
      await user.save();
      console.log(`Admin user ${email} updated successfully.`);
    } else {
      user = await User.create({
        fullName: 'System Admin',
        email,
        password: hashedPassword,
        role: 'admin',
      });
      console.log(`Admin user created successfully:\nID: ${user._id}\nEmail: ${user.email}\nRole: ${user.role}`);
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin();
