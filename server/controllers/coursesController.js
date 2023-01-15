import  {Course }from '../models/Course.js';
import getDataUri from '../utils/datauri.js'; 
import cloudinary from 'cloudinary'; 

const getallcourses = async (req,res,next) =>{
   const courses = await Course.find().select("-lectures"); 
   res.status(201).json({
      success:true,
      courses,
   }); 
}

const createcourse = async (req,res) =>{
   try {
      const {title,description,category,createdBy} = req.body; 
    const file = req.file; 
   const fileUri =  getDataUri(file);
   const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

     await Course.create({
      title,description,category,createdBy,
      poster:{
         public_id:mycloud.public_id,
         url:mycloud.url,
      },
     });
     res.status(201).json({
      success:true,
      message:"course created successfully ....",
     });
      
   } catch (error) {
      console.log(error);
   }
}

const getCourseLectures = async(req,res) =>{
  try {
   const course  = await Course.findById(req.params.id); 
   if(!course) return res.status(401).json({
      success:false,
      message:"Course Not Found"
   }); 

   course.views+=1; 
   await course.save(); 
   res.status(201).json({
      success:true,
      lectures:course.lectures,
     });
  } catch (error) {
   console.log(error); 
  }
}


const addlecture = async(req,res) =>{
  try {
   const {title, description} = req.body; 
   const course  = await Course.findById(req.params.id); 
   if(!course) return res.status(401).json({
      success:false,
      message:"Course Not Found"
   }); 

    const file = req.file; 
   const fileUri =  getDataUri(file);
   const mycloud = await cloudinary.v2.uploader.upload(fileUri.content,{
      resource_type:"video"
   });


  course.lectures.push({
   title,description,
   video:{
      public_id:mycloud.public_id,
      url:mycloud.url
   }
  });
  course.numOfVideos = course.lectures.length(); 
   await course.save(); 
   res.status(201).json({
      success:true,
      message:"Lecture added to course"   
     });
  } catch (error) {
   console.log(error); 
  }
};


const deleteCourse = async (req, res) => {
  const { id } = req.params;
  const course = await Course.findById(id);
  if (!course) return res.status(404).json({success:false,message:"Course not found"});
  await cloudinary.v2.uploader.destroy(course.poster.public_id);

  for (let i = 0; i < course.lectures.length; i++) {
    const singleLecture = course.lectures[i];
    await cloudinary.v2.uploader.destroy(singleLecture.video.public_id, {
      resource_type: "video",
    });
  }
  await course.remove();
  res.status(200).json({
    success: true,
    message: "Course Deleted Successfully",
  });
};


const deleteLecture = async (req, res, next) => {
  const { courseId, lectureId } = req.query;
  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({success:false,message:"Course not found"});

  const lecture = course.lectures.find((item) => {
    if (item._id.toString() === lectureId.toString()) return item;
  });
  await cloudinary.v2.uploader.destroy(lecture.video.public_id, {
    resource_type: "video",
  });

  course.lectures = course.lectures.filter((item) => {
    if (item._id.toString() !== lectureId.toString()) return item;
  });

  course.numOfVideos = course.lectures.length;

  await course.save();

  res.status(200).json({
    success: true,
    message: "Lecture Deleted Successfully",
  });
};






export {getallcourses,createcourse,getCourseLectures,addlecture,deleteCourse,deleteLecture};