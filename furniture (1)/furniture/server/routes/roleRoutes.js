const express=require('express')
const router=express.Router()

const roleController=require('../controller/roleController')

router.get('/role',roleController.getRole)
router.post('/role',roleController.addRole)




module.exports=router;