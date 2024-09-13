const express = require('express');
const router = express.Router();
const apiController = require('../controller/user.controller')


router.post('/players',apiController.players)
router.get('/categories', apiController.questionCategory)
router.get('/questions',apiController.getQuestions )
router.post('/startGame', apiController.startGame)
router.post('/submitAnswer', apiController.submitAnswer)
router.post('/endGame', apiController.endGame)


module.exports = router;
