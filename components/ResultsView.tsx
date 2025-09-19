
import React, { useState } from 'react';
import type { UserAnswer, QuizQuestion } from '../types';
import Spinner from './Spinner';

interface ResultsViewProps {
    answers: UserAnswer[];
    questions: QuizQuestion[];
    topic: string;
    onReset: () => void;
    generateSummary: (topic: string, answers: UserAnswer[], questions: QuizQuestion[]) => Promise<string>;
}

const ResultsView: React.FC<ResultsViewProps> = ({ answers, questions, topic, onReset, generateSummary }) => {
    const [summary, setSummary] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    const correctAnswersCount = answers.filter(a => a.isCorrect).length;
    const scorePercentage = Math.round((correctAnswersCount / answers.length) * 100);

    const handleGenerateSummary = async () => {
        setIsLoading(true);
        const generatedSummary = await generateSummary(topic, answers, questions);
        setSummary(generatedSummary);
        setIsLoading(false);
    };

    const formatSummary = (text: string) => {
        return text
            .split('\n')
            .map((line, index) => {
                if (line.startsWith('**') && line.endsWith('**')) {
                    // FIX: Replace `replaceAll` with `replace` and a global regex for wider compatibility.
                    return <h3 key={index} className="text-xl font-bold text-gray-800 mt-4 mb-2">{line.replace(/\*\*/g, '')}</h3>;
                }
                if (line.startsWith('* ')) {
                    return <li key={index} className="ml-5 list-disc">{line.substring(2)}</li>;
                }
                return <p key={index} className="my-1">{line}</p>;
            });
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg w-full text-center animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-800">Quiz Completed!</h2>
            <p className="text-gray-600 mt-2">You scored</p>
            <p className="text-6xl font-bold text-blue-600 my-4">{correctAnswersCount} / {answers.length}</p>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
                <div 
                    className="bg-green-500 h-4 rounded-full" 
                    style={{ width: `${scorePercentage}%` }}
                ></div>
            </div>

            {!summary && !isLoading && (
                 <button
                    onClick={handleGenerateSummary}
                    className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
                >
                    Generate Performance Summary
                </button>
            )}

            {isLoading && <div className="mt-6 flex justify-center"><Spinner /></div>}
            
            {summary && (
                <div className="mt-8 p-6 bg-gray-50 rounded-lg text-left border border-gray-200 animate-fade-in">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Performance Summary</h2>
                    <div className="text-gray-700 prose max-w-none">{formatSummary(summary)}</div>
                </div>
            )}

            <div className="mt-8">
                <button
                    onClick={onReset}
                    className="bg-gray-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                    Play Again
                </button>
            </div>
        </div>
    );
};

export default ResultsView;