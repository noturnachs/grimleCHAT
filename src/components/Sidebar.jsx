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
  reportedUsername,
  isAdminRequest,
  setIsAdminRequest,
  handleAdminRequest,
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus(); // Focus the textarea when the sidebar is open
    }
  }, [isOpen]);

  return (
    <div
      ref={sidebarRef}
      className={`fixed top-0 right-0 h-full bg-[#1f2e3a] shadow-lg transform transition-transform duration-300 z-9999 ${className} ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
      style={{ width: "80%" }}
    >
      <div className="flex flex-col h-full p-6">
        <button onClick={toggleSidebar} className="text-white self-end mb-4">
          <FaTimes size={20} />
        </button>

        {/* Add toggle buttons for Report/Admin Request */}
        <div className="flex mb-4 bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setIsAdminRequest(false)}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              !isAdminRequest
                ? "bg-blue-500 text-white"
                : "text-gray-300 hover:bg-gray-600"
            }`}
          >
            Report User
          </button>
          <button
            onClick={() => setIsAdminRequest(true)}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              isAdminRequest
                ? "bg-blue-500 text-white"
                : "text-gray-300 hover:bg-gray-600"
            }`}
          >
            Request Admin
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-4 text-white">
          {isAdminRequest ? "Request Admin Assistance" : "Report User"}
        </h2>

        {reportedUsername && !isAdminRequest && (
          <p className="text-lg text-gray-300 mb-4">
            Reporting user{" "}
            <span className="font-semibold text-red-600">
              {reportedUsername}
            </span>
          </p>
        )}
        {reportError && <p className="text-red-500 mb-4">{reportError}</p>}
        {reportSuccess && (
          <p className="text-green-500 mb-4">{reportSuccess}</p>
        )}
        <textarea
          value={reportReason}
          onChange={(e) => setReportReason(e.target.value)}
          placeholder={
            isAdminRequest
              ? "Explain why you need admin assistance..."
              : "Enter the reason for reporting..."
          }
          className="w-full p-2 mb-4 bg-gray-700 text-white rounded-lg resize-none"
          rows={4}
          disabled={isSubmittingReport}
        />

        {/* <div className="mb-4">
          <label className="block text-white font-semibold mb-2">
            Attach a screenshot{" "}
            <span className="text-gray-400 text-[10px]">optional</span>
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
        </div> */}

        <div className="flex justify-end space-x-4">
          <button
            onClick={handleCancel2}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg"
            disabled={isSubmittingReport}
          >
            Cancel
          </button>
          <button
            onClick={isAdminRequest ? handleAdminRequest : handleReportSubmit}
            className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center"
            disabled={isSubmittingReport}
          >
            {isSubmittingReport ? (
              <>
                <l-squircle
                  size="20"
                  stroke="3"
                  speed="1.5"
                  color="white"
                  className="mr-2"
                />
                Sending...
              </>
            ) : isAdminRequest ? (
              "Request Admin"
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
