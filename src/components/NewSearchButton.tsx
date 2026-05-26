import React from 'react';

interface NewSearchButtonProps {
  onClick: () => void;
}

const NewSearchButton: React.FC<NewSearchButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg text-white font-semibold transition-all duration-300"
    >
      New Search
    </button>
  );
};

export default NewSearchButton;
