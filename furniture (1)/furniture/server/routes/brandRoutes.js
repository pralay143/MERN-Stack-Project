const express=require('express')
const router=express.Router()
const brandController=require('../controller/brandController')


router.get('/brand',brandController.getBrand)
router.post('/brand',brandController.addBrand)
router.put('/brand',brandController.updateBrand)
router.delete('/brand/:id',brandController.deleteBrand)





module.exports=router;