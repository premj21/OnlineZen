import mongoose from "mongoose";
import dotenv from 'dotenv'; 
dotenv.config({path:'./config.env'}); 

export const connectDB = async () => {
  const { connection } = await mongoose.connect("mongodb+srv://prem123:prem123@cluster0.md7kd1b.mongodb.net/OnlineZn?retryWrites=true&w=majority");
  console.log(`MongoDB connected `);
};