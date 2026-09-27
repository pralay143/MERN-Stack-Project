const express=require('express')
const router=express.Router()

const cityController=require('./city.controller')

router.get('/city',cityController.getcity)
router.post('/city',cityController.addCity)

module.exports=router