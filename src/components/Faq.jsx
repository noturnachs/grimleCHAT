import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";

function FAQ() {
  const [openQuestion, setOpenQuestion] = useState(null);

  const faqData = [
    {
      question: "Am I matched with people with the same interests?",
      answer:
        "Our website's logic will try to find people who share the same interests as you. If no match is found with the same interests, you will be paired with a random person.",
    },
    // {
    //   question:
    //     "Why can't I read or send messages whenever I came back from switching an app?",
    //   answer:
    //     "Everything sent during the chat is not stored in any way, so whenever you leave the website, everything is gone. That is why you are unable to send or read new messages already. Just find another match.",
    // },
    {
      question: "What happens to inactive rooms after 5 minutes?",
      answer:
        "Rooms that are inactive for 5 minutes will be destroyed to ensure optimal performance and resource management on our platform.",
    },
    {
      question: "Why do I randomly match with users who don't reply?",
      answer:
        'It could be due to many reasons. One reason is that the user may have accidentally performed a "back" action without opting to end the chat or stop finding a match.',
    },
  ];

  return (
    <div className="bg-[#15202b] p-6 rounded-2xl shadow-lg mt-10 max-w-md w-full border border-gray-700/30">
      <h2 className="text-xl font-bold text-white mb-6">
        Frequently Asked Questions
      </h2>

      <div className="space-y-3">
        {faqData.map((faq, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl bg-[#192734] border border-gray-700/20"
          >
            <button
              className="flex items-center justify-between w-full p-4 text-left text-white hover:bg-[#1d2f3f] transition-colors duration-200"
              onClick={() =>
                setOpenQuestion(openQuestion === index ? null : index)
              }
            >
              <span className="pr-4 font-medium">{faq.question}</span>
              <motion.div
                animate={{ rotate: openQuestion === index ? 180 : 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <FiChevronDown className="flex-shrink-0 w-5 h-5 text-gray-400" />
              </motion.div>
            </button>

            <AnimatePresence>
              {openQuestion === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: "auto",
                    opacity: 1,
                    transition: {
                      height: { duration: 0.2, ease: "easeOut" },
                      opacity: { duration: 0.2, ease: "easeOut" },
                    },
                  }}
                  exit={{
                    height: 0,
                    opacity: 0,
                    transition: {
                      height: { duration: 0.2, ease: "easeIn" },
                      opacity: { duration: 0.1 },
                    },
                  }}
                >
                  <div className="px-4 pb-4 text-gray-300 text-sm leading-relaxed">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FAQ;
