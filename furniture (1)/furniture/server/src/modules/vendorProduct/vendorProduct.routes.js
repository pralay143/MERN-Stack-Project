const express=require('express')
const router=express.Router()
const vendor_productController=require('./vendorProduct.controller')


router.get('/get',vendor_productController.getVproduct)
router.post('/add',vendor_productController.addVproduct)



module.exports=router