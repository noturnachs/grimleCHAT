import React, { useState } from "react";

function FAQ() {
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);

  const toggleAnswerVisibility = () => {
    setIsAnswerVisible(!isAnswerVisible);
  };

  return (
    <div className="bg-[#15202b] p-6 rounded-lg shadow-lg mt-10 max-w-md w-full">
      <h2 className="text-xl font-semibold text-white mb-4 text-center">
        Frequently Asked Questions
      </h2>
      <div className="text-sm text-gray-300">
        <div className="mb-4">
          {/* Clickable question */}
          <h2
            className="font-bold text-white text-md mb-3 cursor-pointer bg-[#121b22] rounded p-2"
            onClick={toggleAnswerVisibility}
          >
            Am I matched with people with the same interests?
          </h2>
          {/* Conditionally render the answer with smooth transition */}
          <div
            className={`transition-max-height duration-500 ease-in-out overflow-hidden ${
              isAnswerVisible ? "max-h-40" : "max-h-0"
            }`}
          >
            <p className="text-sm text-justify">
              Our website's logic will try to find people who share the same
              interests as you. If no match is found with the same interests,
              you will be paired with a random person.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FAQ;
