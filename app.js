const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');

//importing model from comment!!!
const Question = require('./models/question');

//--------------------------------------------------------

mongoose.connect('mongodb://localhost:27017/dtu-chat', {
    useNewUrlParser : true,
    useCreateIndex : true,
    useUnifiedTopology : true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () =>{
    console.log("Database Connected!"); 
})

//--------------------------------------------------------

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname , "views"));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(methodOverride('_method'));

//--------------------------------------------------------

app.get("/", (req, res) =>{
    res.render('home');
})

//SHOW ALL THE QUESTIONS
app.get("/questions", async (req, res) =>{
    //show case all your questions here
    const questions = await Question.find({});
    res.render('questions/index', {questions});
});

//FORM FOR NEW QUESTION CREATION
app.get("/questions/new", (req, res) =>{
    res.render('questions/new');
})

//GETTING DATA FROM THE FORM AND MAKING A NEW QUESTION
app.post("/questions", async (req, res) =>{
    const newQuestion = new Question(req.body.questions);
    await newQuestion.save();
    res.redirect('/questions');
})

//LOOKING AT DETAILS OF A SINGLE QUESTION
app.get("/questions/:id", async (req, res) => {
    const question = await Question.findOne({_id : req.params.id});
    res.render("questions/show", {question});
})

//FORM FOR EDITING THE SELECTED QUESTION
app.get("/questions/:id/edit", async (req, res) =>{
    const question = await Question.findOne({_id : req.params.id});
    res.render("questions/edit", {question});
})

//PATCH REQUEST TO UPDATE THE QUESTION
app.patch("/questions/:id" , async(req , res) =>{
    const updatedQuestion = await Question.findByIdAndUpdate(req.params.id , req.body.questions);
    res.redirect(`/questions/${req.params.id}`);
})

app.delete("/questions/:id" , async(req , res) =>{
    const deletedQuestion = await Question.findByIdAndRemove(req.params.id);
    res.redirect('/questions');
})


app.listen(3000 , () =>{
    console.log("Serving on 3000 port!!!");
})
