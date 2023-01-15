import express from 'express'; 
const course= express.Router(); 
import {getallcourses,createcourse, getCourseLectures, addlecture, deleteCourse, deleteLecture} from '../controllers/coursesController.js';
import Authenticated, { authorizedadmin } from '../middlewares/auth.js';
import singleUpload from '../middlewares/multer.js';

course.route("/getallcourses").get(getallcourses);
course.route("/createcourse").post(Authenticated,authorizedadmin,singleUpload,createcourse); 
course.route("/course/:id").get(Authenticated,getCourseLectures).post(Authenticated,singleUpload,addlecture).delete(
    Authenticated,authorizedadmin,deleteCourse); 
    course.route("/lecture").delete(Authenticated,authorizedadmin,deleteLecture); 


export default course; 