import React, { useState, useEffect } from 'react';
import type { QuizQuestion } from '../types';
import Spinner from './Spinner';

interface QuizViewProps {
    question: QuizQuestion;
    questionNumber: number;
    totalQuestions: number;
    // FIX: Add topic to props to provide context for generating explanations.
    topic: string;
    onAnswer: (selectedOption: string) => void;
    onNext: () => void;
    generateExplanation: (question: string, correctAnswer: string, topic: string) => Promise<string>;
}

const QuizView: React.FC<QuizViewProps> = ({ question, questionNumber, totalQuestions, topic, onAnswer, onNext, generateExplanation }) => {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [explanation, setExplanation] = useState<string | null>(null);
    const [isExplanationLoading, setIsExplanationLoading] = useState<boolean>(false);

    useEffect(() => {
        setSelectedAnswer(null);
        setExplanation(null);
        setIsExplanationLoading(false);
    }, [question]);

    const handleOptionClick = async (option: string) => {
        if (selectedAnswer) return;

        setSelectedAnswer(option);
        onAnswer(option);

        // Fetch an explanation for every answer, regardless of whether it's correct or not.
        setIsExplanationLoading(true);
        const generatedExplanation = await generateExplanation(question.questionText, question.correctAnswer, topic);
        setExplanation(generatedExplanation);
        setIsExplanationLoading(false);
    };
    
    const getButtonClass = (option: string) => {
        if (!selectedAnswer) {
            return 'bg-white hover:bg-blue-50 border-gray-200 text-gray-800';
        }
        if (option === question.correctAnswer) {
            return 'bg-green-200 border-green-500 text-green-800';
        }
        if (option === selectedAnswer) {
            return 'bg-red-200 border-red-500 text-red-800';
        }
        return 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300';
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg w-full animate-fade-in">
            <div className="mb-6">
                <p className="text-sm font-semibold text-blue-600">Question {questionNumber} of {totalQuestions}</p>
                <h2 className="text-2xl font-bold text-gray-800 mt-2">{question.questionText}</h2>
            </div>

            <div className="space-y-4">
                {question.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleOptionClick(option)}
                        disabled={!!selectedAnswer}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-300 ${getButtonClass(option)}`}
                    >
                        <span className="font-semibold">{String.fromCharCode(65 + index)}.</span> {option}
                    </button>
                ))}
            </div>

            {explanation && (
                <div className="mt-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded-r-lg animate-fade-in">
                    <h4 className="font-bold text-yellow-800">Explanation</h4>
                    <p className="text-yellow-700 mt-1">{explanation}</p>
                </div>
            )}
            {isExplanationLoading && <div className="mt-6 flex justify-center"><Spinner /></div>}

            {selectedAnswer && (
                <div className="mt-8 text-right">
                    <button
                        onClick={onNext}
                        className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
                    >
                        {questionNumber === totalQuestions ? 'Finish Quiz' : 'Next Question'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default QuizView;