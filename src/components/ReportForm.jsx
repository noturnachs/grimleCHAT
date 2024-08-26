import React, { useState } from "react";
import { FaArrowLeft, FaImage } from "react-icons/fa"; // Import the back icon and image icon
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
    "Problem using video messaging",
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
    <div className="bg-[#15202b] p-6 rounded-lg shadow-lg max-w-md w-full mt-10 ">
      <button
        onClick={handleBack}
        className="flex items-center text-white mb-4 "
      >
        <FaArrowLeft className="mr-2" />
        Back
      </button>
      <h2 className="text-lg font-semibold mb-4 text-white">Report an Issue</h2>
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
      {successMessage && (
        <div className="text-green-500 text-sm mb-4">{successMessage}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="text-white">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading} // Disable input when loading
            className="bg-[#192734] border-2 border-[#3e3e3e] rounded-lg text-white px-4 py-2 w-full"
            placeholder="Your email address"
          />
        </div>

        <div>
          <label htmlFor="problem" className="text-white">
            Select Problem
          </label>
          <select
            id="problem"
            value={selectedProblem}
            onChange={(e) => setSelectedProblem(e.target.value)}
            required
            disabled={loading} // Disable select when loading
            className="bg-[#192734] border-2 border-[#3e3e3e] rounded-lg text-white px-4 py-2 w-full"
          >
            <option value="" disabled>
              Select a problem
            </option>
            {problemOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="issueDescription" className="text-white">
            Describe the Issue
          </label>
          <textarea
            id="issueDescription"
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            required
            disabled={loading} // Disable textarea when loading
            className="bg-[#192734] border-2 border-[#3e3e3e] rounded-lg text-white px-4 py-2 w-full"
            placeholder="Please describe the issue..."
            rows="4"
          />
        </div>

        <div className="flex flex-col ">
          <label
            htmlFor="screenshot"
            className="text-white flex items-baseline"
          >
            Upload Screenshot{" "}
            <span className="text-sm text-blue-400"> &nbsp;(optional)</span>
          </label>
          <input
            type="file"
            id="screenshot"
            accept="image/*"
            onChange={(e) => setScreenshot(e.target.files[0])}
            disabled={loading} // Disable file input when loading
            className="hidden" // Hide the default file input
            onClick={(e) => {
              e.stopPropagation(); // Prevent click event from bubbling up
            }}
          />
          <div
            className="bg-[#192734] border-2 border-[#3e3e3e] rounded-lg text-white px-4 py-2 cursor-pointer"
            onClick={() => document.getElementById("screenshot").click()} // Trigger file input click
          >
            <FaImage className="mr-2 inline" />
            {screenshot ? screenshot.name : "Choose a file..."}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading} // Disable button when loading
          className={`w-full p-2 rounded-md transition ${
            loading ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"
          } text-white`}
        >
          {loading ? (
            <l-ring-2
              size="20"
              stroke="5"
              stroke-length="0.25"
              bg-opacity="0.1"
              speed="0.8"
              color="black"
            />
          ) : (
            "Submit Report"
          )}
        </button>
      </form>
    </div>
  );
};

export default ReportForm;
