/* COMP229 Group Project - The Localhosts*/
let mongoose = require('mongoose');
let answers = require('../models/answer');

// create a model class for the survey
let Survey = mongoose.Schema({
    Title: String,
    QuestionList: [{type: String}],
    NumberOfQuestions: Number,
    Answers: [{type: Array}],
    Author: String,
    ExpiryDate: Date
},
{
  collection: "surveys"
});

module.exports = mongoose.model('Survey', Survey);
