import React, { useState } from "react";

function FAQ() {
  // State to track the currently open question
  const [openQuestion, setOpenQuestion] = useState(null);

  // Function to toggle the visibility of the answer
  const toggleAnswerVisibility = (questionIndex) => {
    // If the clicked question is already open, close it; otherwise, open the clicked question
    setOpenQuestion(openQuestion === questionIndex ? null : questionIndex);
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
            onClick={() => toggleAnswerVisibility(0)} // Pass the index of the question
          >
            Am I matched with people with the same interests?
          </h2>
          {/* Conditionally render the answer with smooth transition */}
          <div
            className={`transition-max-height duration-500 ease-in-out overflow-hidden ${
              openQuestion === 0 ? "max-h-40" : "max-h-0"
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

      <div className="text-sm text-gray-300">
        <div className="mb-4">
          {/* Clickable question */}
          <h2
            className="font-bold text-white text-md mb-3 cursor-pointer bg-[#121b22] rounded p-2"
            onClick={() => toggleAnswerVisibility(1)} // Pass the index of the question
          >
            Why can't I read or send messages whenever I came back from
            switching an app?
          </h2>
          {/* Conditionally render the answer with smooth transition */}
          <div
            className={`transition-max-height duration-500 ease-in-out overflow-hidden ${
              openQuestion === 1 ? "max-h-40" : "max-h-0"
            }`}
          >
            <p className="text-sm text-justify">
              Everything users send during the chat are not stored in anyway, so
              whenever you leave the website everything is gone. That is why you
              are unable to send or read new messages already. Just find another
              match.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FAQ;
