import express from 'express'; 
import dotenv from 'dotenv'; 
import cors from 'cors'; 
import {connectDB} from './config/condatabase.js'; 
import cookieParser from 'cookie-parser';
import cloudinary from 'cloudinary'; 

cloudinary.v2.config({
    cloud_name: 'drvqmymwq',
    api_key:'646358679759156',
    api_secret:'BMwjlkRD8Cnc80xAsw5__27O6z8'
});

connectDB();
dotenv.config({path:'./config/config.env'}); 
const app = express(); 
app.use(express.json()); 
app.use(express.urlencoded({
    extended:true
}));
app.use(cookieParser());
app.use(cors()); 

import router from './routes/useroutes.js';
import course from './routes/couroutes.js';

app.use("/api/v1",router); 
app.use("/api/v1",course); 
app.listen(process.env.PORT,()=>{
    console.log("server is running"); 
})