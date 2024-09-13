const axios = require("axios");
const users = require("../models/apiSchemas");

// payer registering....

const players = async (req, res) => {
  const { playerOne, playerTwo } = req.body;
  try {
    const playerOneName = new users.player({ name: playerOne });
    const playerTwoName = new users.player({ name: playerTwo });

    await playerOneName.save();
    await playerTwoName.save();
    res.send({ status: 200, message: "Successfully registered!" });
  } catch (error) {
    res.send({ status: 404, message: error.message });
  }
};

// player starting the game

const startGame = async (req, res) => {
  const { player1Id, player2Id } = req.body;
  try {
    const playerOne = await users.player.findById(player1Id);
    const playerTwo = await users.player.findById(player2Id);
    if (!playerOne || !playerTwo) {
      return res.status(404).json({ message: "Players not found" });
    }
    const gameSession = new users.game({
      playerOne: playerOne.id,
      playerTwo: playerTwo.id,
      currentTurn: "playerOne",
      isGameOver: false,
    });
    await gameSession.save();

    res.send({ status: 200, message: "Game statred successfully" });
  } catch (error) {
    res.send({ status: 400, error: error.message });
  }
};

const questionCategory = async (req, res) => {
  try {
    const response = await axios.get(
      "https://the-trivia-api.com/api/categories"
    );
    res.json(response.data);
  } catch (error) {
    res.send({ status: 500, error: "Failed to fetch categories" });
  }
};

const getQuestions = async (req, res) => {
  try {
    const { categories, gameId } = req.body;
    console.log(categories, gameId);
    const questions = await axios.get(
      `https://the-trivia-api.com/api/questions?categories=${categories}`
    );
    const allQuestions = questions.data;

    // question fillter krna difficulty level ke anusar
    const easyQuestions = allQuestions
      .filter((ques) => ques.difficulty === "easy")
      .slice(0, 2);
    const mediumQuestions = allQuestions
      .filter((ques) => ques.difficulty === "medium")
      .slice(0, 2);
    const hardQuestions = allQuestions
      .filter((ques) => ques.difficulty === "hard")
      .slice(0, 2);

    let filterdQuestions = [
      ...easyQuestions,
      ...mediumQuestions,
      ...hardQuestions,
    ];


    const questionNeed = 6;
    if (filterdQuestions.length < questionNeed) {
      const remainingQuesNeed = questionNeed - filterdQuestions.length;

      const remainingQuestions = allQuestions
        .filter((ques) => !filterdQuestions.includes(ques))
        .slice(0, remainingQuesNeed);
      filterdQuestions = [...filterdQuestions, ...remainingQuestions];
    }
    // question ke anwer ko random set krna...

    const updateQuestions = filterdQuestions.map((question) => {
      const incorrectAnswers = question.incorrectAnswers;
      const allOptions = Math.floor(
        Math.random() * (incorrectAnswers.length + 1)
      );
      incorrectAnswers.splice(allOptions, 0, question.correctAnswer);
      return {
        question: question.question,
        options: incorrectAnswers,
        ques_ID: question.id,
        category: question.category,
        difficultyLevel: question.difficulty,
        correctAnswer: question.correctAnswer,
      };
    });

    const game = await users.game.findOne({ _id: gameId });
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }
    game.questions = updateQuestions;
    await game.save();
    res.json(updateQuestions);
  } catch (error) {
    console.log(error, "Error");

    res.send({ status: 500, error: "Failed to fetch questions" });
  }
};

const submitAnswer = async (req, res) => {
  const { gameId, questionId, playerId, answer, currentTurn } = req.body;
  try {
    const game = await users.game.findById(gameId);

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    if (!game.questions || !Array.isArray(game.questions)) {
      return res.status(404).json({ message: "Questions not found in game" });
    }

    const question = game.questions.find(
      (q) => q.ques_ID.toString() === questionId
    );
    
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const player =
      game.playerOne.toString() === playerId
        ? game.playerOne
        : game.playerTwo.toString() === playerId
        ? game.playerTwo
        : null;

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }
    let points = 0;
    if (answer === question.correctAnswer) {
      points =
        question.difficulty === "easy"
          ? 10
          : question.difficulty === "medium"
          ? 15
          : 20;
    }

    if (currentTurn === "playerOne") {
      if (playerId === game.playerOne.toString()) {
        game.score.playerOne += points;

      } else {
        return res
          .status(400)
          .json({ message: "Player mismatch with current turn" });
      }
    } else if (currentTurn === "playerTwo") {
      if (playerId === game.playerTwo.toString()) {
        game.score.playerTwo += points;
      } else {
        return res
          .status(400)
          .json({ message: "Player mismatch with current turn" });
      }
    } else {
      return res.status(400).json({ message: "Invalid current turn state" });
    }

    // Save the updated game document
    await game.save();
    res.status(200).json({
      message:
        answer === question.correctAnswer
          ? 'Correct answer'
          : "Incorrect answer",
      score: game.score,
      currentTurn: game.currentTurn,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const endGame = async (req, res) => {
  const { gameId } = req.body;
  try {
    const game = await users.game.findById(gameId);
    if (!gameId) {
      return res.status(404).json({ message: "Game not found" });
    }
    game.isGameOver = true;
    await game.save();

    const playerOne = {
        id: game.playerOne, // Directly using IDs
        score: game.score.playerOne
      };
      const playerTwo = {
        id: game.playerTwo,
        score: game.score.playerTwo
      }
      let winner, loser;
      if (playerOne.score > playerTwo.score) {
        winner = {  name: 'playerOne' ,score: playerOne.score};
        loser = { name: 'playerTwo' ,score: playerTwo.score};
      } else if (playerTwo.score > playerOne.score) {
        winner = {  name: 'playerTwo', score: playerTwo.score };
        loser = {  name: 'playerOne', score: playerOne.score };
      } else {
        winner = null; // It's a tie
      }
      console.log("Winner:", winner);
      res.status(200).json({
        gameId,
        playerOne: {
          id: playerOne._id,
          name: playerOne.name,
          score: playerOne.score
        },
        playerTwo: {
          id: playerTwo._id,
          name: playerTwo.name,
          score: playerTwo.score
        },
        winner: winner ? winner : "Tie"
      });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  players,
  startGame,
  questionCategory,
  getQuestions,
  submitAnswer,
  endGame,
};
