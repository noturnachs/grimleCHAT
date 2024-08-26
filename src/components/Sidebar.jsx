import React, { useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";

function Sidebar({
  isOpen,
  toggleSidebar,
  reportReason,
  setReportReason,
  handleReportSubmit,
  handleScreenshotChange,
  handleCancel2,
  screenshot,
  reportError,
  reportSuccess,
  isSubmittingReport,
  sidebarRef,
  className,
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus(); // Focus the textarea when the sidebar is open
    }
  }, [isOpen]);

  return (
    <div
      ref={sidebarRef} // Attach ref to the sidebar
      className={`absolute top-0 right-0 h-full bg-[#1f2e3a] shadow-lg transform transition-transform duration-300 ${className} ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
      style={{ width: "80%" }}
    >
      <div className="flex flex-col h-full p-6">
        <button onClick={toggleSidebar} className="text-white self-end mb-4">
          <FaTimes size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-white">Report User</h2>
        {reportError && <p className="text-red-500 mb-4">{reportError}</p>}
        {reportSuccess && (
          <p className="text-green-500 mb-4">{reportSuccess}</p>
        )}
        <textarea
          ref={textareaRef}
          value={reportReason}
          onChange={(e) => setReportReason(e.target.value)}
          placeholder="Enter the reason for reporting"
          className="w-full p-2 mb-4 bg-gray-700 text-white rounded-lg resize-none"
          rows={4}
          disabled={isSubmittingReport}
        />

        <div className="mb-4">
          <label className="block text-white font-semibold mb-2">
            Attach a screenshot
          </label>
          <div className="flex items-center">
            <label
              htmlFor="file-upload"
              className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
            >
              Choose File
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleScreenshotChange}
              className="hidden"
            />
            {screenshot && (
              <span className="ml-4 text-gray-300">{screenshot.name}</span>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={handleCancel2}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg"
            disabled={isSubmittingReport}
          >
            Cancel
          </button>
          <button
            onClick={handleReportSubmit}
            className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center"
            disabled={isSubmittingReport}
          >
            {isSubmittingReport ? (
              <l-squircle
                size="20"
                stroke="3"
                speed="1.5"
                color="white"
                className="mr-2"
              />
            ) : (
              "Send Report"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
