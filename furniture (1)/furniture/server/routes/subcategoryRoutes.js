const express=require('express')
const router=express.Router()
const subcategoryController=require('../controller/subcategoryController')


router.get('/subcategory',subcategoryController.getSubcategory)
router.post('/subcategory',subcategoryController.addSubcategory)
router.put('/subcategory',subcategoryController.updateSubcategory)
router.delete('/subcategory/:id',subcategoryController.deleteSubcategory)





module.exports=router;