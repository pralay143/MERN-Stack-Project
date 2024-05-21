const express=require('express')
const router=express.Router()

const cityController=require('../controller/cityController')

router.get('/city',cityController.getcity)
router.post('/city',cityController.addCity)

module.exports=router