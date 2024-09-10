document.addEventListener('DOMContentLoaded', function() {
    const numQuestions = 4;
    let currentQuestionIndex = 0;
    let correctAnswersCount = 0;
    let timerInterval;
    let selectedAnswers = {};
    let answeredQuestions = new Set();
    let questions = [];

    async function fetchWikipediaArticles(query) {
        const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`);
        const data = await response.json();
        return data.query.search;
    }

    function generateIncorrectOptions(correctOption, allOptions, numOptions = 3) {
        let incorrectOptions = [];
        while (incorrectOptions.length < numOptions) {
            const randomIndex = Math.floor(Math.random() * allOptions.length);
            const option = allOptions[randomIndex];
            if (option !== correctOption && !incorrectOptions.includes(option)) {
                incorrectOptions.push(option);
            }
        }
        return incorrectOptions;
    }

    function getRandomQuestions(articles, numQuestions) {
        const allTitles = articles.map(article => article.title);
        let selectedArticles = [];
        let selectedTitles = new Set();

        while (selectedArticles.length < numQuestions) {
            const randomIndex = Math.floor(Math.random() * articles.length);
            const article = articles[randomIndex];
            const title = article.title;

            if (!selectedTitles.has(title)) {
                selectedTitles.add(title);
                selectedArticles.push(article);
            }
        }
        return selectedArticles;
    }

    async function fetchQuestionsFromWikipedia() {
        const articles = await fetchWikipediaArticles('India heritage culture');
        const selectedArticles = getRandomQuestions(articles, numQuestions);
        const allTitles = articles.map(article => article.title);

        questions = selectedArticles.map((article, index) => {
            const title = article.title;
            const snippet = article.snippet.replace(/<\/?[^>]+>/gi, ''); 

            const correctOption = title; 
            const incorrectOptions = generateIncorrectOptions(
                correctOption,
                allTitles.filter(t => t !== title)
            );
            const options = [correctOption, ...incorrectOptions].sort(() => Math.random() - 0.5); 

            const correctIndex = options.indexOf(correctOption);

            return {
                question: `Which of the following is related to: ${snippet}?`,
                options: {
                    A: options[0],
                    B: options[1],
                    C: options[2],
                    D: options[3]
                },
                correct: ['A', 'B', 'C', 'D'][correctIndex]
            };
        });

        displayQuestion();
        startTimer();
    }

    function displayQuestion() {
        const questionElement = document.getElementById('question');
        const optionsContainer = document.querySelector('.options');
        const quizList = document.getElementById('quiz-list');
        const question = questions[currentQuestionIndex];

        questionElement.innerHTML = `<p>${question.question}</p>`;

        optionsContainer.innerHTML = '';
        for (let key in question.options) {
            const isChecked = selectedAnswers[currentQuestionIndex] === key ? 'checked' : '';
            optionsContainer.innerHTML += `
                <input type="radio" id="option-${key.toLowerCase()}" name="quiz" value="${key}" ${isChecked} ${selectedAnswers[currentQuestionIndex] !== undefined ? 'disabled' : ''}>
                <label class="option" for="option-${key.toLowerCase()}"> ${key}) ${question.options[key]} <span class="checkmark">✔️</span></label>
            `;
        }

        quizList.innerHTML = '';
        questions.forEach((q, index) => {
            const isAnswered = answeredQuestions.has(index);
            const isCurrent = index === currentQuestionIndex;
            const isCorrect = selectedAnswers[index] === q.correct;
            const listItemClasses = [
                isAnswered ? (isCorrect ? 'correct' : 'incorrect') : '',
                isCurrent ? 'current' : ''
            ].join(' ').trim();
            quizList.innerHTML += `
                <li class="${listItemClasses}" data-index="${index}">
                    Quiz Question ${index + 1} ${isAnswered ? '<span class="checkmark">✔️</span>' : ''}
                </li>
            `;
        });

        document.getElementById('result-text').style.display = 'none';
    }

    function moveToNextQuestion() {
        currentQuestionIndex++;
        if (currentQuestionIndex >= questions.length) {
            showFinalScore();
            return;
        }
        displayQuestion();
        resetTimer();
    }

    function moveToQuestion(index) {
        if (index >= 0 && index < questions.length) {
            if (index < currentQuestionIndex || answeredQuestions.has(index) || index === currentQuestionIndex + 1) {
                currentQuestionIndex = index;
                displayQuestion();
                resetTimer();
            }
        }
    }

    function showFinalScore() {
        const resultText = document.getElementById('result-text');
        const progressBar = document.getElementById('progress-bar');
        const totalQuestions = questions.length;
        const passingThreshold = 50;
        const percentage = (correctAnswersCount / totalQuestions) * 100;
    
        progressBar.style.width = `${percentage}%`;
        progressBar.textContent = `${correctAnswersCount} / ${totalQuestions} (${percentage.toFixed(1)}%)`;

        const passFailStatus = percentage >= passingThreshold ? 'Pass' : 'Fail';

        resultText.textContent = `Quiz completed! You answered ${correctAnswersCount} out of ${totalQuestions} questions correctly. You ${passFailStatus}!`;
        resultText.style.display = 'block';
        document.getElementById('question').style.display = 'none';
        document.querySelector('.options').style.display = 'none';
        document.querySelector('.submit-button').style.display = 'none';
        document.querySelector('.result').style.display = 'block';
        document.querySelector('.timer').style.display = 'none';

        const quizList = document.getElementById('quiz-list');
        quizList.innerHTML = '';
        questions.forEach((q, index) => {
            const isAnswered = answeredQuestions.has(index);
            const isCorrect = selectedAnswers[index] === q.correct;
            const listItemClasses = isAnswered ? (isCorrect ? 'correct' : 'incorrect') : '';
            quizList.innerHTML += `
                <li class="${listItemClasses}" data-index="${index}">
                    Quiz Question ${index + 1} ${isAnswered ? '<span class="checkmark">✔️</span>' : ''}
                </li>
            `;
        });

        clearInterval(timerInterval);
    }

    function restartQuiz() {

        currentQuestionIndex = 0;
        correctAnswersCount = 0;
        startTimer();
    
        document.getElementById('result-page').style.display = 'none';
        document.querySelector('.quiz-container').style.display = 'block';
        document.querySelector('.sidebar').style.display = 'block';

        setupNewQuestions();
    }

    const resultText = document.getElementById('result-text');
    const submitButton = document.querySelector('.submit-button');
    const timerInner = document.getElementById('timer');
    const timerCircle = document.querySelector('.timer-circle');

    let seconds = 30;
    const totalSeconds = 30;

    function updateTimer() {
        const progress = (seconds / totalSeconds) * 100;
        timerCircle.style.background = `conic-gradient(#4CAF50 ${progress}%, #f0f0f0 0%)`;
        timerInner.textContent = seconds;

        if (seconds <= 0) {
            clearInterval(timerInterval);

            resultText.textContent = 'Time\'s up! The correct answer was ' + questions[currentQuestionIndex].options[questions[currentQuestionIndex].correct];
            resultText.style.display = 'block';

            answeredQuestions.add(currentQuestionIndex);

            setTimeout(moveToNextQuestion, 1000);
        } else {
            seconds--;
        }
    }

    function startTimer() {
        timerInterval = setInterval(updateTimer, 1000);
    }

    function resetTimer() {
        clearInterval(timerInterval);
        seconds = totalSeconds;
        updateTimer();
        startTimer();
    }

    submitButton.addEventListener('click', function() {
        const selectedOption = document.querySelector('input[name="quiz"]:checked');
        if (!selectedOption) {
            alert('Please select an option');
            return;
        }

        const selectedAnswer = selectedOption.value;
        const correctAnswer = questions[currentQuestionIndex].correct;

        if (selectedAnswer === correctAnswer) {
            resultText.textContent = 'Correct!';
            correctAnswersCount++;
        } else {
            resultText.textContent = 'Incorrect! The correct answer was ' + questions[currentQuestionIndex].options[correctAnswer];
        }

        selectedAnswers[currentQuestionIndex] = selectedAnswer;
        answeredQuestions.add(currentQuestionIndex);
        displayQuestion();
        setTimeout(moveToNextQuestion, 1000);
    });

    document.getElementById('quiz-list').addEventListener('click', function(event) {
        const listItem = event.target.closest('li');
        if (listItem) {
            const index = parseInt(listItem.getAttribute('data-index'));
            moveToQuestion(index);
        }
    });

    fetchQuestionsFromWikipedia();
});
