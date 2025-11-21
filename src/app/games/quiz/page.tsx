'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  answer: string;
};

const QuizPage = () => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    fetch('/data/quiz.json')
      .then((res) => res.json())
      .then((data) => setQuestions(data));
  }, []);

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    if (answer === questions[currentQuestionIndex].answer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    setIsAnswered(false);
    setSelectedAnswer(null);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowResult(false);
  };

  if (questions.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-4xl font-bold mb-6">クイズ結果</h1>
        <p className="text-2xl mb-8">
          {questions.length}問中 {score}問正解！
        </p>
        <button
          onClick={handleRestart}
          className="px-6 py-3 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition"
        >
          もう一度挑戦する
        </button>
        <Link href="/" className="mt-4 text-pink-400 hover:underline">
          トップページへ戻る
        </Link>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-8">
      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">
          第{currentQuestionIndex + 1}問
        </h1>
        <p className="text-lg mb-6">{currentQuestion.question}</p>

        <div className="grid grid-cols-1 gap-4">
          {currentQuestion.options.map((option) => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              disabled={isAnswered}
              className={`p-4 rounded-lg text-left transition ${
                isAnswered
                  ? option === currentQuestion.answer
                    ? 'bg-green-500' // Correct answer
                    : option === selectedAnswer
                    ? 'bg-red-500' // Incorrect selected answer
                    : 'bg-gray-700'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {isAnswered && (
          <div className="mt-6 text-center">
            <p
              className={`text-xl font-bold ${
                selectedAnswer === currentQuestion.answer
                  ? 'text-green-400'
                  : 'text-red-400'
              }`}
            >
              {selectedAnswer === currentQuestion.answer ? '正解！' : '不正解…'}
            </p>
            <p className="mt-2">正解は「{currentQuestion.answer}」です。</p>
            <button
              onClick={handleNextQuestion}
              className="mt-4 px-6 py-2 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition"
            >
              {currentQuestionIndex < questions.length - 1
                ? '次の問題へ'
                : '結果を見る'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
