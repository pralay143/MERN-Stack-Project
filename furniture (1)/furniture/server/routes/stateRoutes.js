const express=require('express')
const router=express.Router()

const stateController=require('../controller/stateController')

router.post('/state',stateController.addState)
router.get('/state',stateController.getstate)
module.exports=router
