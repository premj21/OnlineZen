import express from 'express'; 
const router= express.Router(); 
import { useregister
    ,Userlogin
     ,getMyProfile
     ,logout
     ,changepassword
     ,updateprofile,
    updateprofilepicture,
forgetpassword, 
resetpassword,
addtoplaylist,
removefromplaylist} from '../controllers/userinfo.js';
import Authenticated from '../middlewares/auth.js';
import singleUpload from '../middlewares/multer.js';

router.route("/login").post(Userlogin);
router.route("/register").post(singleUpload,useregister);
router.route("/logout").get(logout);
router.route("/me").get(Authenticated,getMyProfile);
router.route("/changepassword").put(Authenticated,changepassword);
router.route("/profileupdate").put(Authenticated,updateprofile);
router.route("/updateprofilepicture").put(singleUpload,Authenticated,updateprofilepicture);
router.route("/forgetpassword").post(forgetpassword);
router.route("/resetpassword/:token").put(resetpassword);
router.route("/addtoplaylist").post(Authenticated,addtoplaylist);
router.route("/removefromplaylist").delete(Authenticated,removefromplaylist);




export default router; 
