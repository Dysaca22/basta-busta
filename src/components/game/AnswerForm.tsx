import { useState } from 'react';

import { type PlayerAnswers } from '@types';


interface AnswerFormProps {
    categories: string[];
    onSubmit: (answers: PlayerAnswers) => void;
}

const AnswerForm = ({ categories, onSubmit }: AnswerFormProps) => {
    const [answers, setAnswers] = useState<PlayerAnswers>({});

    const handleChange = (category: string, value: string) => {
        setAnswers(prevAnswers => ({
            ...prevAnswers,
            [category]: value,
        }));
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit(answers);
    };

    return (
        <form onSubmit={handleSubmit}>
            {categories.map(category => (
                <div key={category}>
                    <label htmlFor={category}>{category}</label>
                    <input
                        id={category}
                        type="text"
                        onChange={(e) => handleChange(category, e.target.value)}
                        value={answers[category] || ''}
                    />
                </div>
            ))}
            {/* El botón de submit estará en el componente padre (PartyPage) */}
        </form>
    );
};

export default AnswerForm;
