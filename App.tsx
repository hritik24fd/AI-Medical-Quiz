
import React, { useState, useCallback } from 'react';
import { QuizQuestion, UserAnswer, QuizState } from './types';
import { generateQuizQuestions, generateExplanationForAnswer, generateQuizSummary } from './services/geminiService';
import TopicSelector from './components/TopicSelector';
import QuizView from './components/QuizView';
import ResultsView from './components/ResultsView';
import { drugTopics } from './constants';

const App: React.FC = () => {
    const [quizState, setQuizState] = useState<QuizState>(QuizState.NOT_STARTED);
    const [topic, setTopic] = useState<string>(drugTopics[0]);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const startQuiz = useCallback(async (selectedTopic: string) => {
        setIsLoading(true);
        setError(null);
        setTopic(selectedTopic);
        try {
            const fetchedQuestions = await generateQuizQuestions(selectedTopic);
            setQuestions(fetchedQuestions);
            setQuizState(QuizState.IN_PROGRESS);
            setCurrentQuestionIndex(0);
            setUserAnswers([]);
        } catch (err) {
            setError('Failed to generate quiz questions. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleAnswer = (answer: string) => {
        const isCorrect = questions[currentQuestionIndex].correctAnswer === answer;
        const newUserAnswers = [...userAnswers, { question: questions[currentQuestionIndex].questionText, answer, isCorrect }];
        setUserAnswers(newUserAnswers);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setQuizState(QuizState.COMPLETED);
        }
    };
    
    const resetQuiz = () => {
        setQuizState(QuizState.NOT_STARTED);
        setQuestions([]);
        setUserAnswers([]);
        setCurrentQuestionIndex(0);
        setError(null);
    };

    const renderContent = () => {
        if (error) {
            return (
                <div className="text-center p-8 bg-white rounded-lg shadow-lg">
                    <p className="text-red-500 text-xl">{error}</p>
                    <button onClick={resetQuiz} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Try Again
                    </button>
                </div>
            );
        }

        switch (quizState) {
            case QuizState.NOT_STARTED:
                return <TopicSelector onStartQuiz={startQuiz} isLoading={isLoading} />;
            case QuizState.IN_PROGRESS:
                return (
                    <QuizView
                        question={questions[currentQuestionIndex]}
                        questionNumber={currentQuestionIndex + 1}
                        totalQuestions={questions.length}
                        // FIX: Pass topic to QuizView to provide context for generating explanations.
                        topic={topic}
                        onAnswer={handleAnswer}
                        onNext={handleNextQuestion}
                        generateExplanation={generateExplanationForAnswer}
                    />
                );
            case QuizState.COMPLETED:
                return (
                    <ResultsView
                        answers={userAnswers}
                        questions={questions}
                        topic={topic}
                        onReset={resetQuiz}
                        generateSummary={generateQuizSummary}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
            <header className="text-center mb-8">
                <h1 className="text-5xl font-bold text-blue-800">MediQuiz AI</h1>
                <p className="text-gray-600 mt-2 text-lg">Test your medical knowledge with AI-powered questions</p>
            </header>
            <main className="w-full max-w-3xl mx-auto">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;
