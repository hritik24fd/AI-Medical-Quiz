
export interface QuizQuestion {
    questionText: string;
    options: string[];
    correctAnswer: string;
}

export interface UserAnswer {
    question: string;
    answer: string;
    isCorrect: boolean;
}

export enum QuizState {
    NOT_STARTED = 'NOT_STARTED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
}
