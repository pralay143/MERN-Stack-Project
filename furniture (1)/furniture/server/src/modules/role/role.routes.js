const express=require('express')
const router=express.Router()

const roleController=require('./role.controller')

router.get('/role',roleController.getRole)
router.post('/role',roleController.addRole)




module.exports=router;