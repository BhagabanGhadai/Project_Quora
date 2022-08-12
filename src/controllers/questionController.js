const questionModel = require("../models/questionModel");
const userModel = require("../models/userModel");
const answerModel = require("../models/answerModel");
const validator = require("../validator/validator");



/******************************************************Create Question*************************************************/

const createQuestion = async (req, res) => {
  try {
    let data = req.body;
    const { description, askedBy } = data;

    if (!Object.keys(data).length) {
      return res.status(400).send({ status: false, message: "Please provide the valid data to post a question." })
    }

    if (!validator.isValid(askedBy))
      return res.status(400).send({ status: false, message: "askedBy is required to post a question." });

    const checkUser = await userModel.findOne({ _id: askedBy });
    if (!checkUser)
      return res.status(400).send({ status: false, message: `User doesn't exist with the ID: ${askedBy}.` })

    if (checkUser.creditScore == 0) {
      return res.status(400).send({
        status: false,
        message: "Your creditScore is 0, hence cannot post question.",
      });
    }
   
    if (!validator.isValid(description))
      return res.status(400).send({ status: false, message: "Question description is required." })

    if (data.tag) {
      let tags = data.tag.split(',').map(x => x.trim())
      data.tag = tags
    }

    if (isDeleted == true) data.deletedAt = new Date()

    const addQuestion = await questionModel.create(data);
    if(checkUser.creditScore>0 && addQuestion){
      const deductCreditScore = checkUser.creditScore - 100;  
        await userModel.findOneAndUpdate(
          { _id: askedBy },
          { creditScore: deductCreditScore });
    }

    return res.status(201).send({ status: true, message: "Question posted Successfully.", data: saveQuestion });
  } catch (err) {
    return res.status(500).send({ Error: err.message });
  }
};


/*******************************************************Get All Question**********************************************/


const getAllQuestion = async (req, res) => {

  try {

    let data = req.query;
    data.isDeleted = false

    let { tag, sort } = queryParams;

    if (!validator.validString(tag)) {
      return res.status(400).send({ status: false, message: "Tag is required." })
    }

    if (tag) {
      let tags = tag.split(',').map(x => x.trim())
      queryParams.tag = tags
    }

    if (!validator.validString(sort)) {
      return res.status(400).send({ status: false, message: "sort is required." })
    }

    if (sort) {
      if (
        !(
          sort.toLowerCase() == "ascending" ||
          sort.toLowerCase() == "descending"
        )
      ) {
        return res.status(400).send({
          message: `Only 'ascending' & 'descending' are allowed to sort.`,
        });
      }
      if (sort.toLowerCase() === "ascending") {
        let sortValue = 1;
      }

      if (sort.toLowerCase() === "descending") {
        let sortValue = -1;
      }
    }
    let findQuestions = await questionModel
      .find(filterQuery).lean().sort({ createdAt: sortValue }).select({ createdAt: 0, updatedAt: 0, __v: 0 });

    // return res.status(200).send({ status: true, message: "Questions List", data: findQuestions });

      for (i in findQuestions) {
        let answer = await answerModel
          .find({ questionId: findQuestions[i]._id })
          .select({ text: 1, answeredBy: 1 });
        // console.log(answer)

        findQuestions[i].answers = answer;
        // console.log(findQuestionsByTag[i])
      }

      if (findQuestions.length == 0) {
        return res.status(400).send({
          status: false,
          message: `No Question found by tag - ${tag}`,
        });
      }

     
    return res.status(400).send({
      status: false,
      message: "No filters provided to search questions.",
    });
  } catch (err) {
    return res.status(500).send({ Error: err.message });
  }
};


/*******************************************************Get Question By Id********************************************/


const getQuestionById = async function (req, res) {

  try {

    const data = req.params.questionId;

    if (!validator.isValidObjectId(data)) {
      return res.status(400).send({ status: false, message: `${data} is not a valid question id` });
    }

    const findQuestion = await questionModel.findOne({
      _id: data,
      isDeleted: false,
    });

    if (!findQuestion) {
      return res.status(404).send({ status: false, message: `No questions exists by ${questionId}` });
    }

    const answersOfTheQuestion = await answerModel
      .find({ questionId: data })
      .sort({ createdAt: -1 })
      .select({ createdAt: 0, updatedAt: 0, __v: 0 });

    const description = findQuestion.description;
    const tag = findQuestion.tag;
    const askedBy = findQuestion.askedBy;

    const questionWithAnswer = {
      description,
      tag,
      askedBy,
      answers: answersOfTheQuestion,
    };
    return res.status(200).send({ status: true, message: "Question fetched successfully.", data: questionWithAnswer });

  } catch (err) {
    return res.status(500).send({ status: false, Error: err.message });
  }
};


/********************************************************Update Question**********************************************/

const updateQuestion = async (req, res) => {

  try {

    const data = req.params.questionId;
    let bodyData = req.body;

    const { tag, description } = bodyData;

    if (!validator.isValidObjectId(data))
      return res.status(400).send({ status: false, message: `${questionId} is invalid questionId` });

    const checkQuestion = await questionModel.findOne({
      _id: data,
      isDeleted: false,
    });

    if (!checkQuestion)
      return res.status(404).send({ status: false, message: `Question doesn't exists by ${data}` });


    if (!validator.validString(tag)) return res.status(400).send({ status: false, message: "Tag cannot be empty for updatation.", });


    if (tag) {
      let tags = tag.split(',').map(x => x.trim())
      bodyData.tag = tags
    }

    if (!validator.validString(description))
      return res.status(400).send({ status: false, message: `Description cannot be empty for updatation.` });


    questionData.updatedAt = new Date();
    const updateQuestion = await questionModel.findOneAndUpdate(
      { _id: data },
      bodyData,
      { new: true }
    );

    return res.status(200).send({ status: true, message: "Question updated successfully", data: updateQuestion });

  } catch (err) {
    return res.status(500).send({ Error: err.message });
  }
};


/******************************************************Delete Question************************************************/

const deleteQuestion = async (req, res) => {

  try {

    const data = req.params.questionId;

    if (!validator.isValidObjectId(data)) {
      return res.status(400).send({ status: false, message: `${data} is not a valid question id` })
    }

    const findQuestion = await questionModel.findOne({
      _id: data,
    });

    if (!findQuestion)
      return res.status(404).send({ status: false, message: `No Question found for This Id:${data}` });

    if (findQuestion.isDeleted == true)
      return res.status(404).send({ status: false, message: `Question has been already deleted.` });

    await questionModel.findOneAndUpdate(
      { _id: data },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );

    return res.status(200).send({ status: true, message: `Question deleted successfully.` });

  } catch (err) {
    return res.status(500).send({ Error: err.message });
  }
};

module.exports = { createQuestion, getAllQuestion, getQuestionById, updateQuestion, deleteQuestion }