const mongoose = require('mongoose');


const playerSchema = new mongoose.Schema({
    name:{
        type: 'string',
        required: true
    }
})
const player = mongoose.model('player', playerSchema);

const gameSchema = new mongoose.Schema({
    playerOne: { type: mongoose.Schema.Types.ObjectId, ref: 'player', required: true },  // Player ki id
    playerTwo: { type: mongoose.Schema.Types.ObjectId, ref: 'player',required: true },  
    questions:  [
        {
          question: { type: String, required: true },
          options: [{ type: String }],
          ques_ID: {type:mongoose.Schema.Types.ObjectId},
          category: { type: String },
          difficultyLevel: { type: String },
          correctAnswer: { type: String }
        }
      ], 
    currentTurn: { type: String, enum: ['playerOne', 'playerTwo'],required: true },  // Kis player ki turn hai
    category: String,  // Jo category choose ki gayi hai
    difficulty: String,
    score: {
        playerOne: { type: Number, default: 0 },
        playerTwo: { type: Number, default: 0 }
    },
    isGameOver: { type: Boolean, default: false }
});

const game = mongoose.model('game', gameSchema);



module.exports = {player , game}
