const express = require('express');
const app = express();
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
const routes = require('./routes/api.router');
const port = 3000;

app.use(cors());
app.use(express.urlencoded({extended: true}))
app.use(express.json());
app.use('/', routes)

app.get('/', (req, res) => {
    res.send(JSON.stringify("Welcome to trivdata : Mr Om"));
})




mongoose.connect('mongodb://localhost:27017/triviaGame',)
.then(()=> console.log("Connected to triviaGame database"))
.catch(err => console.log("Connection Error in database",err))



app.listen(port,() =>{
    console.log(`server listening on${port}`); 
})