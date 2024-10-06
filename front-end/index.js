document.addEventListener("DOMContentLoaded", () => {
  const apiUrl = "http://localhost:3000";

  const playersId = {
    playerOne: "",
    playerTwo: "",
  };

  function setPlayerIds(playerOneId, playerTwoId) {
    playersId.playerOne = playerOneId;
    playersId.playerTwo = playerTwoId;
  }

  const gameSession = {
    gameId: "",
  };

  let selectedCategory = "";
  console.log(selectedCategory);

  // const selectedCategory = "";
  const enterBtn = document.getElementById("Enter");
  enterBtn.addEventListener("click", async () => {
    const playerOne = document.getElementById("playerOne").value.trim();
    const playerTwo = document.getElementById("playerTwo").value.trim();
    const showResponse = document.getElementById("showRes");
    // console.log(playerOne, playerTwo);

    if (!playerOne || !playerTwo) {
      showResponse.textContent = "Please enter both player names.";
      return; // Early return if validation fails
    }

    const postUrl = apiUrl + "/players";
    const result = await fetch(postUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        playerOne: playerOne,
        playerTwo: playerTwo,
      }),
    });
    const resultRes = await result.json();
    console.log(resultRes);

    if (resultRes.status == 200) {
      showResponse.textContent = resultRes.message;
      setTimeout(() => {
        showResponse.textContent = "";
      }, 2000);
      const playerOneID = resultRes.playerOneName._id;
      const playerTwoID = resultRes.playerTwoName._id;
      // console.log(playerOneID, playerTwoID , "asdfghjmk,l.");

      playersId.playerOne = playerOneID;
      playersId.playerTwo = playerTwoID;
      setPlayerIds(playerOneID, playerTwoID);
    }
  });

  const startGame = document.getElementById("startBtn");
  startGame.addEventListener("click", async () => {
    if (!playersId.playerOne || !playersId.playerTwo) {
      alert("Both players must be registered before starting the game.");
      return;
    }
    const postUrl = apiUrl + "/startGame";
    const result = await fetch(postUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        player1Id: playersId.playerOne,
        player2Id: playersId.playerTwo,
      }),
    });
    const resultResponse = await result.json();
    console.log(resultResponse);
    const showResponse = document.getElementById("showRes");
    if (resultResponse.status === 200) {
      showResponse.innerText = resultResponse.message;
      setTimeout(() => {
        showResponse.innerText = "";
      }, 2000);

      const gameId = resultResponse._id;
      // console.log(gameId , "gameId aaa rhi  hai .................");
      gameSession.gameId = gameId;
    }
  });

  const searchCategory = document.getElementById("search");
  searchCategory.addEventListener("click", async () => {
    const postUrl = apiUrl + "/categories";
    const result = await fetch(postUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      // body: JSON.stringify()
    });
    const resultResponse = await result.json();
    // console.log(resultResponse , "asdfghjklkjhg");
    const getCategory = document.getElementById("category");
    resultResponse.forEach((item) => {
      const option = document.createElement("option");
      option.textContent = item;
      getCategory.appendChild(option);
    });

    getCategory.addEventListener("change", (event) => {
      selectedCategory = event.target.value;
      document.getElementById("selectedCategory").textContent =
        selectedCategory;
      // console.log(selectedCategory, "selectedCategory");
    });
    // setInterval(() => {
    //     console.log(selectedCategory, "Global selectedCategory");
    // }, 2000);
    console.log(selectedCategory, "hello");
  });

  let currentQuestionIndex = 0; // Start with the first question
  let currentTurn = "playerOne";
  let allQuestions = [];
  let selectedAnswer = "";
  const searchQuestion = document.getElementById("searchQues");
  searchQuestion.addEventListener("click", async () => {
    if (!selectedCategory) {
      alert("Please select a category before fetching questions.");
      return;
    }
    
    console.log(selectedCategory);
    console.log(gameSession.gameId);
    let gameId = gameSession.gameId;
    let categories = selectedCategory;
    const questionURl = `${apiUrl}/questions?category=${encodeURIComponent(
      categories
    )}&gameId=${encodeURIComponent(gameId)}`;
    const quesResult = await fetch(questionURl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!quesResult.ok) {
      throw new Error(`HTTP error! status: ${quesResult.status}`);
    }
    allQuestions = await quesResult.json();
    console.log(allQuestions);
    displayQuestion();
  });

  function displayQuestion() {
    const currentTurnElement = document.getElementById("currentTurn");
    currentTurnElement.innerText = `It's ${currentTurn}'s turn`;
    if (currentQuestionIndex < allQuestions.length) {
      const currentQuestion = allQuestions[currentQuestionIndex];

      document.getElementById("questionText").innerText =
        currentQuestion.question;
      const alloptions = document.getElementById("optionscontainer");
      alloptions.innerHTML = "";

      currentQuestion.options.map((option) => {
        const optionElement = document.createElement("button");
        optionElement.innerHTML = option;
        optionElement.classList.add("optionBtn");
        optionElement.addEventListener("click", () => selectOption(option));
        alloptions.appendChild(optionElement);
      });
      console.log(currentTurn, currentQuestion.question);
    } else {
      document.getElementById("questionText").innerText =
        "All questions are finished.";
      document.getElementById("optionscontainer").innerHTML = "";
    }
  }

  function selectOption(answer) {
    selectedAnswer = answer;
    console.log(selectedAnswer, "selectedAnswer");
  }

  const submitAnswer = document.getElementById("submitAnswer");
  submitAnswer.addEventListener("click", async () => {
    if (!selectedAnswer) {
      alert("Please select an answer before submitting.");
      return;
    }
    const gameId = gameSession.gameId;
    const questionId = allQuestions[currentQuestionIndex].ques_ID;
    const playerId = playersId[currentTurn];
    const answer = selectedAnswer;
    const submitUrl = apiUrl + "/submitAnswer";
    const submitResult = await fetch(submitUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gameId,
        questionId,
        playerId,
        answer,
        currentTurn,
      }),
    });

    const resultResponse = await submitResult.json();
    console.log(resultResponse);
    const scoreOne = document.getElementById("scoreOne");
    const scoreTwo = document.getElementById("scoreTwo");
    const showResponse = document.getElementById("showRes");

    if (submitResult.status === 200) {
      console.log(resultResponse.message);
      scoreOne.innerText = resultResponse.score.playerOne;
      scoreTwo.innerText = resultResponse.score.playerTwo;
      showResponse.innerText = resultResponse.message;
      // window.alert(resultResponse.message);
    } else {
      console.error(resultResponse.message);
    }
    displayQuestion();
  });

  const nextQuestionButton = document.getElementById("nextQuestion");
  nextQuestionButton.addEventListener("click", () => {
    currentTurn = currentTurn === "playerOne" ? "playerTwo" : "playerOne";

    currentQuestionIndex++;

    displayQuestion();
  });

  const endGame = document.getElementById("endGame");
  endGame.addEventListener("click", async () => {
    const gameId = gameSession.gameId;
    const endGameUrl = apiUrl + "/endGame";
    const endGameResult = await fetch(endGameUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gameId: gameId }),
    });
    const gameResult = await endGameResult.json();
    console.log(gameResult);
    const winner = document.getElementById("winner");
    const score = document.getElementById("score");
    winner.textContent = gameResult.winner.name;
    winner.style.display = 'block';
  });
});
