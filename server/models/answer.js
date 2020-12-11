/* COMP229 Group Project - The Localhosts*/
let mongoose = require('mongoose');

//create a model class for the questions
let SurveyAnswer = mongoose.Schema({
  Answer: [{type: String}]
},
{
  collection: "answers"
});

module.exports = mongoose.model('SurveyAnswer', SurveyAnswer);