/* COMP229 Group Project - The Localhosts*/
// modules required for routing
let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
const surveys = require('../models/surveys');

// define the survey model
let survey = require('../models/surveys');
let answer = require('../models/answer');

let jwt = require('jsonwebtoken');

let passport = require('passport');

// helper function for guard purposes
function requireAuth(req, res, next)
{
    // check if the user is logged in
    if(!req.isAuthenticated())
    {
        return res.redirect('/login');
    }
    next();
}

/* GET surveys List page. READ */
router.get('/', (req, res, next) => {
  // find all surveys in the surveys collection
  survey.find({
    "ExpiryDate": { $gte : new Date()}    
  },(err, surveys) => {
    console.log(surveys);
    if (err) {
      return console.error(err);
    }
    else {
      res.render('surveys/index', {
        title: 'Surveys', 
        displayName: req.user ? req.user.displayName : '',
        surveys: surveys
      });
    }
  });

});

/* GET surveys List page. READ FOR ADMIN */
router.get('/admin',requireAuth, (req, res, next) => {
  // find all surveys in the surveys collection
  survey.find({
    "Author": req.user ? req.user.displayName : ''
  }, (err, surveys) => {
    console.log(surveys);
    if (err) {
      return console.error(err);
    }
    else {
      res.render('surveys/index', {
        title: 'My Surveys', 
        displayName: req.user ? req.user.displayName : '',
        surveys: surveys
      });
    }
  });

});

//  GET the Survey Details page in order to add a new Survey
router.get('/add',requireAuth, (req, res, next) => {
    res.render('surveys/add', {title: 'Add Survey', displayName: req.user ? req.user.displayName : '',
     questionNum: 1})
});

// POST process the Survey Details page and create a new Survey
router.post('/add',requireAuth, (req, res, next) => {
  let questionNum = parseInt(req.body.questionNum);
  var questions = [];
  for (var i = 0; i < questionNum; i++)
  {
    eval("questions.push(req.body.Question"+(i+1)+");");
  }
  let newSurvey = survey({
    "Title": req.body.Title,
    "QuestionList": questions,
    "NumberOfQuestions": questions.length,
    "Author": req.user.displayName,
    "ExpiryDate": new Date(req.body.ExpiryDate)
  })
  survey.create(newSurvey, (err, Survey) =>{
    if(err)
    {
        console.log(err);
        res.end(err);
    }
    else
    {
        //refresh the survey list
        res.redirect('/surveys');
    }
})
});

router.post('/newquestion',requireAuth, (req, res, next) => {
  let questionNum = parseInt(req.body.questionNum);
  var questions = [];
  for (var i = 0; i < questionNum; i++)
  {
    eval("questions.push(req.body.Question"+(i+1)+");");
  }
  let newSurvey = survey({
    "Title": req.body.Title,
    "QuestionList": questions,
    "NumberOfQuestions": (questions.length + 1),
    "Author": req.user.displayName,
    "ExpiryDate": new Date(req.body.ExpiryDate)
  })

  survey.create(newSurvey, (err, Survey) =>{
    if(err)
    {
        console.log(err);
        res.end(err);
    }
    else
    {
        //refresh the survey list
        console.log(Survey._id);
        eval("res.redirect('/surveys/edit/"+`${Survey._id}`+"');");
    }
})
});

// GET the Survey details page in order to edit an existing Survey
router.get('/edit/:id',requireAuth, (req, res, next) => {

  let id = req.params.id; 

  survey.findById(id, (err, currentSurvey) =>{
      if(err)
      {
          console.log(err);
          res.end(err);
      }
      else
      {
        console.log(currentSurvey)
        if (req.user.displayName == currentSurvey.Author)
        {
          res.render('surveys/edit', {title: 'Edit Survey Info', displayName: req.user ? req.user.displayName : '',
           survey: currentSurvey, questionNum: currentSurvey.NumberOfQuestions, ExpiryDate: currentSurvey.ExpiryDate})
        }
        else
        {
          res.redirect('/surveys');
        }
      }
  });
});

// POST - process the questions passed from the survey and update the form
router.post('/edit/:id',requireAuth, (req, res, next) => {
  let id = req.params.id;
  let questionNum = parseInt(req.body.questionNum);
  var questions = [];
  for (var i = 0; i < questionNum; i++)
  {
    eval("questions.push(req.body.Question"+(i+1)+");");
  }
  survey.findByIdAndUpdate(id, {$set:{
    "Title": req.body.Title,
    "QuestionList": questions,
    "NumberOfQuestions": (questions.length),
    "Author": req.user.displayName,
    "ExpiryDate": new Date(req.body.ExpiryDate)

  }}, function (err, doc) {
    if (err) {
        console.log("Something wrong when updating data!");
    }

    res.redirect('/surveys');

  });

});

router.post('/newquestionfromedit/:id',requireAuth, (req, res, next) => {
  let questionNum = parseInt(req.body.questionNum);
  var questions = [];
  for (var i = 0; i < questionNum; i++)
  {
    eval("questions.push(req.body.Question"+(i+1)+");");
  }
  let id = req.params.id;
  survey.findByIdAndUpdate(id, {$set:{
    "Title": req.body.Title,
    "QuestionList": questions,
    "NumberOfQuestions": (questions.length + 1),
    "Author": req.user.displayName,
    "ExpiryDate": new Date(req.body.ExpiryDate)
  }}, function (err, doc) {
    if (err) {
        console.log("Something wrong when updating data!");
    }
    eval("res.redirect('/surveys/edit/"+`${id}`+"');");
  });
});

router.post('/deletequestion/:id',requireAuth, (req, res, next) => {
  let questionNum = parseInt(req.body.questionNum);
  let deleteNum = req.query;
  var questions = [];
  for (var i = 0; i < questionNum; i++)
  {
    if (i != deleteNum)
    {
      eval("questions.push(req.body.Question"+(i+1)+");");
    }
  }
  let id = req.params.id;
  survey.findByIdAndUpdate(id, {$set:{
    "Title": req.body.Title,
    "QuestionList": questions,
    "NumberOfQuestions": (questions.length - 1),
    "Author": req.user.displayName,
    "ExpiryDate": new Date(req.body.ExpiryDate)
  }}, function (err, doc) {
    if (err) {
        console.log("Something wrong when updating data!");
    }
    eval("res.redirect('/surveys/edit/"+`${id}`+"');");
  });
});

// GET - process the survey deletion by survey id
router.get('/delete/:id',requireAuth, (req, res, next) => {
  let id = req.params.id;
  survey.findById(id, (err, currentSurvey) =>{
    if (req.user.displayName == currentSurvey.Author)
    {
      survey.remove({_id: id}, (err) => {
          if(err)
          {
              console.log(err);
              res.end(err);
          }
          else
          {
              //refresh the contact list
              res.redirect('/surveys');
          }
      })
    }
    else
    {
      res.redirect('/surveys');
    }
  });
});

// GET - Take the survey by survey id
router.get('/view/:id', (req, res, next) => {

  let id = req.params.id; 

  survey.findById(id, (err, currentSurvey) =>{
      if(err)
      {
        console.log(err);
        res.end(err);
      }
      else
      {
        if (currentSurvey.ExpiryDate >= new Date())
        {
          console.log(currentSurvey)
          res.render('surveys/views', {title: 'View Survey Info', displayName: req.user ? req.user.displayName : '',
          survey: currentSurvey, questionNum: currentSurvey.NumberOfQuestions})
        }
        else
        {
          res.redirect('/surveys');
        }
      }
  });
});

// POST - process the survey submission

router.post('/view/:id', (req, res, next) => {
  let id = req.params.id
  let questionNum = parseInt(req.body.questionNum);
  var answers = [];
  for (var i = 0; i < questionNum; i++)
  {
    eval("answers.push(req.body.Answer"+(i+1)+");");
  }
  //refresh the survey list
  survey.findByIdAndUpdate(id, 
    {$push: {"Answers": answers}}
  , function (err, doc) {
    if (err) {
        console.log("Something wrong when updating data!");
    }
    res.redirect('/surveys');
  });
});

// GET - view the survey results
router.get('/results/:id',requireAuth, (req, res, next) => {

  let id = req.params.id; 

  survey.findById(id, (err, currentSurvey) =>{
      if(err)
      {
          console.log(err);
          res.end(err);
      }
      else
      {
        console.log(currentSurvey)
        
        if (req.user.displayName == currentSurvey.Author)
        {
          res.render('surveys/results', {title: 'View Survey Results', displayName: req.user ? req.user.displayName : '',
           survey: currentSurvey})
        }
        else
        {
          res.redirect('/surveys');
        }
      }
  })
});

module.exports = router;
