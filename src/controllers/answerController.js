const questionModel = require("../models/questionModel");
const userModel = require("../models/userModel");
const answerModel = require("../models/answerModel");
const validator = require("../validator/validator");


/********************************************************Create Answer************************************************/

const createAnswer = async (req, res) => {

  try {

    let data = req.body;

    const { questionId, answeredBy, text } = data;

    if (!validator.isValidRequestBody(data))
      return res.status(400).send({ status: false, message: "Empty body.Please provide a request body." });

    if (!validator.isValidObjectId(questionId))
      return res.status(400).send({ status: false, message: `${questionId} is not a valid question id` });

    if (!validator.isValidObjectId(answeredBy))
      return res.status(400).send({ status: false, message: "Not a valid usedId" });

    if (!validator.isValid(text))
      return res.status(400).send({ status: false, message: `Text is required` });

    const checkUser = await userModel.findOne({ _id: answeredBy });
    if (!checkUser)
      return res.status(400).send({ status: false, message: "User not found." });

    const checkQuestion = await questionModel.findOne({ _id: questionId, isDeleted: false, });

    if (!checkQuestion)
      return res.status(400).send({ status: false, message: "Mo Such Question Found" });

    if (checkQuestion.askedBy == answeredBy)
      return res.status(400).send({ status: false, message: "You can't answer your own question." });

    const saveAnswer = await answerModel.create(requestBody);

    // Updating the creditScore by 200 after answering a question.
    if (saveAnswer) {
      await userModel.findOneAndUpdate(
        { _id: answeredBy },
        { $inc: { creditScore: 200 } }
      );
    }

    return res.status(201).send({
      status: true, message: "Question answered successfully & creditScore of 200 added to your account.", data: saveAnswer
    });

  } catch (err) {

    return res.status(500).send({ status: false, Error: err.message, });

  }
};


/****************************************************************Get All Answer*******************************************/

const getAllAnswers = async (req, res) => {

  try {

    let question_Id = req.params.questionId;

    if (!validator.isValidObjectId(question_Id))
      return res.status(400).send({ status: false, message: `${question_Id} is not a valid question Id` });

    const searchQuestion = await questionModel.findOne({ _id: question_Id });

    if (!searchQuestion)
      return res.status(404).send({ status: false, message: `Question doesn't exists by ${questionId}` });

    const getAnswers = await answerModel.find({ questionId: question_Id }).select({ createdAt: 0, updatedAt: 0, __v: 0 });

    if (!getAnswers.length)
      return res.status(404).send({ status: false, message: `No such answers found` });

    return res.status(200).send({ status: true, message: `Answer fetched successfully!!`, data: getAnswers, });


  } catch (err) {
    return res.status(500).send({ status: false, Error: err.message });
  }
};



/**************************************************************Update Answer********************************************/

const updateAnswer = async (req, res) => {

  try {

    const bodyData = req.body;
    const answer_Id = req.params.answerId;

    let { text } = requestBody;

    if (!validator.isValidRequestBody(bodyData))
      return res.status(400).send({ status: false, message: `Unable to update empty request body.` });

    if (!validator.isValidObjectId(answer_Id))
      return res.status(400).send({ status: false, message: `${answer_Id} is not a valid answerId` });

    const findAnswer = await answerModel.findOne({ _id: answer_Id, isDeleted: false });

    if (!findAnswer)
      return res.status(400).send({ status: false, message: `No answer found by ${answer_Id}` });

    if (!validator.isValid(text))
      return res.status(400).send({ status: false, message: "Please provide the answer to update." });

    const updatedAnswer = await answerModel.findOneAndUpdate(
      { _id: answer_Id },
      { text: text },
      { new: true }
    );

    return res.status(200).send({ status: true, message: "Answer updated successfully.", data: updatedAnswer });

  } catch (err) {
    return res.status(500).send({ status: false, Error: err.message });
  }
};


/*************************************************************Delete Answer*******************************************/

const deleteAnswer = async (req, res) => {

  try {

    const answer_Id = req.params.answerId;
    let bodyData = req.body;

    const { answeredBy, questionId } = bodyData;

    if (!validator.isValidRequestBody(bodyData))
      return res.status(400).send({ status: false, message: "Empty body.Please provide a request body to delete." });

    if (!validator.isValid(answeredBy))
      return res.status(400).send({ status: false, message: `answeredBy is required to delete the answer.` });

    if (!validator.isValidObjectId(answeredBy))
      return res.status(400).send({ status: false, message: `${answeredBy} is not a valid answeredBy id` });

    if (!validator.isValid(questionId))
      return res.status(400).send({ status: false, message: `questionId is required to delete the answer.` });

    if (!validator.isValidObjectId(questionId))
      return res.status(400).send({ status: false, message: `${questionId} is not a valid question id`, });

    if (!validator.isValidObjectId(answer_Id))
      return res.status(400).send({ status: false, message: `${answer_Id} is not a valid answer id` });

    const findAnswer = await answerModel.findOne({ _id: answer_Id, isDeleted: false, });

    if (!findAnswer)
      return res.status(404).send({ status: false, message: `No answer exists by the Id: ${answer_Id}` })

    if (findAnswer.answeredBy != answeredBy) {
      return res.status(400).send({ status: false, message: `Unable to delete the answer because it is not answered by you.` })
    }

    if (findAnswer.answeredBy == answeredBy) {
      await answerModel.findOneAndUpdate(
        { _id: answer_Id },
        { $set: { isDeleted: true } },
        { new: true }
      );
    }

    return res.status(200).send({ status: true, message: `Answer deleted successfully.` });

  } catch (err) {

    return res.status(500).send({ status: false, Error: err.message, });

  }
}

module.exports = { createAnswer, getAllAnswers, updateAnswer, deleteAnswer }