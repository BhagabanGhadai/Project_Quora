const mongoose = require("mongoose");

const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false; //it checks whether the value is null or undefined.
  if (typeof value === "string" && value.trim().length === 0) return false; //it checks whether the string contain only space or not
  return true;
};

const isValidObjectId = function (objectId) {
  return mongoose.Types.ObjectId.isValid(objectId);
};


const validString = function (value) {
  if (typeof value === "string" && value.trim().length === 0) return false; //it checks whether the string contain only space or not
  return true;
};

module.exports = {isValid,isValidObjectId,validString};