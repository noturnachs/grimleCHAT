import React, { useState, useEffect } from "react";

function ReportHistory({ visitorId }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true); // Add this state for collapse functionality

  const getAdminMessage = (report) => {
    if (report.action_taken === "ban") {
      return `User ${report.reported_username} has been banned. Thank you for helping keep the community safe.`;
    } else if (report.action_taken === "dismiss") {
      return "Thank you for reporting but after careful review your report doesn't match the criteria for a ban.";
    }
    return null; // Return null for pending reports
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_ORIGIN}/api/reports/history/${visitorId}`
        );
        const data = await response.json();

        // Check if data is an error message or array
        if (Array.isArray(data)) {
          setReports(data);
        } else {
          console.error("Unexpected data format:", data);
          setReports([]);
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
        setReports([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    if (visitorId) {
      fetchReports();
    } else {
      setReports([]); // Set empty array when no visitorId
    }
  }, [visitorId]);

  if (loading) {
    return (
      <div className="mt-10 w-full max-w-md mb-10">
        <div className="bg-[#15202b] rounded-lg p-4 shadow-lg border border-gray-700/50">
          <div className="flex items-center justify-center space-x-2 text-gray-400">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading reports...</span>
          </div>
        </div>
      </div>
    );
  }

  if (reports.length === 0) {
    return null;
  }

  return (
    <div className="mt-10 w-full max-w-md mb-10">
      <div className="bg-[#15202b] rounded-lg p-4 shadow-lg border border-gray-700/50">
        {/* Collapsible Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-between items-center text-left"
        >
          <h3 className="text-gray-200 font-medium">Your Report History</h3>
          <svg
            className={`w-5 h-5 transform transition-transform text-gray-400 hover:text-gray-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Collapsible Content */}
        {isOpen && (
          <div className="space-y-3 mt-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex flex-col p-3 rounded-lg bg-gray-800/50 border border-gray-700/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-sm text-gray-300">
                      User:{" "}
                      <span className="font-semibold text-red-500">
                        {report.reported_username}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(report.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      report.action_taken === "ban"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : report.action_taken === "dismiss"
                        ? "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                        : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    }`}
                  >
                    {report.action_taken === "ban"
                      ? "Banned"
                      : report.action_taken === "dismiss"
                      ? "Dismissed"
                      : "Pending"}
                  </span>
                </div>

                {/* Admin Message */}
                {report.action_taken && report.action_taken !== "pending" && (
                  <div
                    className={`text-xs mt-2 p-2 rounded ${
                      report.action_taken === "ban"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                    }`}
                  >
                    <p>{getAdminMessage(report)}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportHistory;
