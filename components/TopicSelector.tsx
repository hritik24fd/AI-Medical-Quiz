
import React, { useState } from 'react';
import { drugTopics } from '../constants';
import Spinner from './Spinner';

interface TopicSelectorProps {
    onStartQuiz: (topic: string) => void;
    isLoading: boolean;
}

const TopicSelector: React.FC<TopicSelectorProps> = ({ onStartQuiz, isLoading }) => {
    const [selectedTopic, setSelectedTopic] = useState<string>(drugTopics[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onStartQuiz(selectedTopic);
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg text-center animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Select Your Topic</h2>
            <p className="text-gray-600 mb-8">Choose a drug to begin your specialized quiz.</p>
            <form onSubmit={handleSubmit}>
                <div className="mb-6">
                    <select
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        disabled={isLoading}
                    >
                        {drugTopics.map(topic => (
                            <option key={topic} value={topic}>{topic}</option>
                        ))}
                    </select>
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                    disabled={isLoading}
                >
                    {isLoading ? <Spinner /> : 'Start Quiz'}
                </button>
            </form>
        </div>
    );
};

export default TopicSelector;
