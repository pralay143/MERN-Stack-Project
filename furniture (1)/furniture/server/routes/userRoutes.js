const express=require('express')
const router=express.Router()
const userController=require('../controller/userController')


router.get('/user',userController.getUser)
router.post('/user',userController.addUser)
router.put('/user',userController.updateUser)
router.get('/user/:id',userController.getUserById)
router.delete('/user/:id',userController.deleteUser)
router.post('/user/login',userController.loginUser)





module.exports=router;