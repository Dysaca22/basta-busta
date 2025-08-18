import { type PlayerAnswers } from "@types";


interface AnswerFormProps {
    categories: string[];
    answers: PlayerAnswers;
    onAnswerChange: (answers: PlayerAnswers) => void;
    isRoundOver: boolean;
}

const AnswerForm = ({
    categories,
    answers,
    onAnswerChange,
    isRoundOver,
}: AnswerFormProps) => {
    const handleChange = (category: string, value: string) => {
        const newAnswers = {
            ...answers,
            [category]: value,
        };
        onAnswerChange(newAnswers);
    };

    return (
        <form onSubmit={(e) => e.preventDefault()}>
            {categories.map((category) => (
                <div key={category} className="mb-3">
                    <label
                        htmlFor={category}
                        className="block text-lg font-semibold mb-1"
                    >
                        {category}
                    </label>
                    <input
                        id={category}
                        type="text"
                        onChange={(e) => handleChange(category, e.target.value)}
                        value={answers[category] || ""}
                        disabled={isRoundOver}
                        className="w-full px-4 py-2 text-black rounded-md border-2 border-gray-300 focus:border-yellow-500 focus:outline-none"
                    />
                </div>
            ))}
        </form>
    );
};

export default AnswerForm;