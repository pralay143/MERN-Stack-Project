const express=require('express')
const  router=express.Router()
 
const fileUploadController=require('./upload.controller')

router.post('/Upload',fileUploadController.uploadFile)


module.exports=router 