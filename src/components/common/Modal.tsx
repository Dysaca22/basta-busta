import React from 'react';

interface ModalProps {
    isOpen: boolean;
    title: string;
    children: React.ReactNode;
    onClose: () => void;
}

const Modal = ({ isOpen, title, children, onClose }: ModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md text-white border border-gray-600">
                <h2 className="text-2xl font-bold mb-4">{title}</h2>
                <div className="mb-6">{children}</div>
                <button
                    onClick={onClose}
                    className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    OK
                </button>
            </div>
        </div>
    );
};

export default Modal;