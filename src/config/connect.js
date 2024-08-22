import mongoose from "mongoose";

export const connectDB = async (uri) => {
  try {
    await mongoose.connect(uri);
    console.info("Connected to MongoDB! ✅");
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}❌`);
  }
};
