const express=require('express')
const router=express.Router()
const categoryController=require('../controller/categoryController')


router.get('/category',categoryController.getCategory)
router.post('/category',categoryController.addCategory)
router.put('/category',categoryController.updateCategory)
router.delete('/category/:id',categoryController.deleteCategory)





module.exports=router;