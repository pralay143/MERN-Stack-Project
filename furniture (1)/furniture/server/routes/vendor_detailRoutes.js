const express=require('express')
const router=express.Router()

const vendor_detailController=require('../controller/vendor_detailController')

router.post('/vendor',vendor_detailController.addDetail)
router.get('/vendor',vendor_detailController.getVendordetail)
router.put('/vendor',vendor_detailController.updateData)
router.get('/vendor/:id',vendor_detailController.getVendorById)
router.delete('/vendor/:id',vendor_detailController.deleteVendor)


module.exports=router