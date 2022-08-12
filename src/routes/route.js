const express = require('express');
const router = express.Router();

const middleware = require('../middleWare/check') 
const userController = require('../controllers/userController')
const questionController = require('../controllers/questionController')
const answerController = require('../controllers/answerController')

/*>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>User APIs>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/

router.post('/register',userController.registerUser)
router.post('/login',userController.loginUser)
router.get('/user/:userId/profile',middleware.authentication,userController.getUserProfile)
router.put('/user/:userId/profile',middleware.authentication,userController.updateUserProfile)

/*>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Question APIs>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/

router.post('/question',middleware.authentication,questionController.createQuestion)
router.get('/questions',questionController.getAllQuestion)
router.get('/questions/:questionId',questionController.getQuestionById)
router.put('/questions/:questionId',middleware.authentication,questionController.updateQuestion)
router.delete('/questions/:questionId',middleware.authentication,questionController.deleteQuestion)

/*>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Answer APIs>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/

router.post('/answer',middleware.authentication,answerController.createAnswer)
router.get('/questions/:questionId/answer',answerController.getAllAnswers)
router.put('/answer/:answerId',middleware.authentication,answerController.updateAnswer)
router.delete('/answers/:answerId',middleware.authentication,answerController.deleteAnswer)



module.exports = router;