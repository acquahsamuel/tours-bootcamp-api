const express = require('express')
const router = express.Router()
const fs = require('fs')
const tourController = require('./../controllers/tourController')

router.param('/id',(req , res , next ,val )=>{
  console.log(`This id is ${req.param}`);
})

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour)
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour)

module.exports = router
