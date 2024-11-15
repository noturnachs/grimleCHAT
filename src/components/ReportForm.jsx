import React, { useState } from "react";
import {
  FaArrowLeft,
  FaImage,
  FaEnvelope,
  FaExclamationCircle,
} from "react-icons/fa";
import { ring2 } from "ldrs"; // Import the loader

ring2.register(); // Register the loader

const ReportForm = () => {
  const [email, setEmail] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [selectedProblem, setSelectedProblem] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const [screenshot, setScreenshot] = useState(null); // State for the uploaded screenshot

  const problemOptions = [
    "Problem sending message",
    "Problem sending image",
    "Problem sending voice message",
    "Found a bug",
    "Suggestion",
    // "Problem using video messaging",
    "Other", // You can add more options as needed
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true); // Set loading to true

    // Basic validation
    if (!email || !issueDescription || !selectedProblem) {
      setError("Please fill in all fields.");
      setLoading(false); // Reset loading state
      return;
    }

    // Create a FormData object to handle file upload
    const formData = new FormData();
    formData.append("email", email);
    formData.append("issueDescription", issueDescription);
    formData.append("selectedProblem", selectedProblem);
    if (screenshot) {
      formData.append("screenshot", screenshot); // Append the screenshot file
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_ORIGIN}/api/reportbugs`, // Updated endpoint
        {
          method: "POST",
          body: formData, // Send FormData
        }
      );

      if (response.ok) {
        setSuccessMessage(
          "Your report has been submitted successfully. Expect an email in a few hours regarding your report. Thank you!"
        );
        // Clear the form
        setEmail("");
        setIssueDescription("");
        setSelectedProblem("");
        setScreenshot(null); // Clear the screenshot
      } else {
        setError("Failed to submit the report. Please try again later.");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      setError("An error occurred while submitting your report.");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const handleBack = () => {
    // Logic to go back, e.g., navigate to the previous page
    window.history.back(); // This will take the user back to the previous page
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-[#192734] p-4">
      <div className="bg-[#15202b] p-8 rounded-2xl shadow-lg w-full max-w-md mt-10 sm:mt-20 border border-gray-700/30">
        <button
          onClick={handleBack}
          className="group flex items-center text-gray-400 hover:text-white transition-colors duration-200 mb-6"
        >
          <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
          <span>Back</span>
        </button>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Report an Issue
          </h2>
          <p className="text-gray-400 text-sm">
            Help us improve your experience
          </p>
        </div>
        {error && (
          <div className="flex items-center bg-red-500/10 text-red-500 text-sm p-4 rounded-lg mb-6">
            <FaExclamationCircle className="flex-shrink-0 mr-2" />
            {error}
          </div>
        )}{" "}
        {successMessage && (
          <div className="bg-green-500/10 text-green-400 text-sm p-4 rounded-lg mb-6">
            {successMessage}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-300"
            >
              Email Address
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full bg-[#192734] border-2 border-gray-700/50 focus:border-blue-500/50 rounded-xl 
                text-white pl-10 pr-4 py-3 outline-none transition-colors duration-200
                focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                placeholder="your@email.com"
              />
            </div>
          </div>

          {/* Problem Selection */}
          <div className="space-y-2">
            <label
              htmlFor="problem"
              className="text-sm font-medium text-gray-300"
            >
              Type of Issue
            </label>
            <div className="relative">
              <select
                id="problem"
                value={selectedProblem}
                onChange={(e) => setSelectedProblem(e.target.value)}
                required
                disabled={loading}
                className="w-full bg-[#192734] border-2 border-gray-700/50 focus:border-blue-500/50 rounded-xl
      text-white px-4 py-3 outline-none appearance-none transition-colors duration-200
      focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
              >
                <option value="" disabled>
                  Select a problem
                </option>
                {problemOptions.map((option, index) => (
                  <option key={index} value={option} className="bg-[#192734]">
                    {option}
                  </option>
                ))}
              </select>
              {/* Custom dropdown arrow */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <label
              htmlFor="issueDescription"
              className="text-sm font-medium text-gray-300"
            >
              Description
            </label>
            <textarea
              id="issueDescription"
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              required
              disabled={loading}
              className="w-full bg-[#192734] border-2 border-gray-700/50 focus:border-blue-500/50 rounded-xl
              text-white px-4 py-3 outline-none min-h-[120px] transition-colors duration-200
              focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
              placeholder="Please describe the issue in detail..."
            />
          </div>

          {/* Screenshot Upload */}
          <div className="space-y-2">
            <label
              htmlFor="screenshot"
              className="text-sm font-medium text-gray-300 flex items-center"
            >
              Screenshot
              <span className="ml-2 text-xs text-blue-400">(optional)</span>
            </label>
            <input
              type="file"
              id="screenshot"
              accept="image/*"
              onChange={(e) => setScreenshot(e.target.files[0])}
              disabled={loading}
              className="hidden"
            />
            <div
              onClick={() => document.getElementById("screenshot").click()}
              className="group flex items-center justify-center w-full bg-[#192734] border-2 border-gray-700/50 
              border-dashed rounded-xl px-4 py-4 cursor-pointer hover:border-blue-500/50 transition-colors duration-200"
            >
              <div className="flex flex-col items-center space-y-2 text-gray-400 group-hover:text-gray-300">
                <FaImage className="w-8 h-8" />
                <span className="text-sm">
                  {screenshot ? screenshot.name : "Click to upload screenshot"}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600
            text-white font-medium py-3 px-4 rounded-xl transition-all duration-200
            disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center">
              {loading ? (
                <l-ring-2
                  size="24"
                  stroke="3"
                  stroke-length="0.25"
                  bg-opacity="0.1"
                  speed="0.8"
                  color="white"
                />
              ) : (
                "Submit Report"
              )}
            </span>
            <div
              className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 
              translate-y-full group-hover:translate-y-0 transition-transform duration-300"
            />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportForm;
