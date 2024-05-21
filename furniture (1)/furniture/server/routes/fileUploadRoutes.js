const express=require('express')
const  router=express.Router()
 
const fileUploadController=require('../controller/fileUploadController')

router.post('/Upload',fileUploadController.uploadFile)


module.exports=router 