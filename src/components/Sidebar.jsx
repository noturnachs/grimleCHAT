import React, { useEffect, useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function Sidebar({
  isOpen,
  toggleSidebar,
  reportReason,
  setReportReason,
  handleCancel2,
  reportError,
  reportSuccess,
  isSubmittingReport,
  sidebarRef,
  className,
  conversationRef,
  partnerVisitorId,
  setReportError,
  setReportSuccess,
  setIsSubmittingReport,
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const captureConversationAsPDF = async () => {
    const chatElement = conversationRef.current;
    if (!chatElement) {
      console.error("Chat element not found");
      return null;
    }

    // Create a clone of the chat element
    const clone = chatElement.cloneNode(true);

    // Remove the sidebar from the clone
    const sidebarElement = clone.querySelector(".sidebar");
    if (sidebarElement) {
      sidebarElement.remove();
    }

    // Remove any other elements you don't want in the PDF
    // For example, if you have a report button:
    const reportButton = clone.querySelector(".report-button");
    if (reportButton) {
      reportButton.remove();
    }

    // Apply styles to make sure the clone renders correctly
    clone.style.position = "absolute";
    clone.style.left = "-9999px";
    clone.style.top = "0";
    clone.style.width = `${chatElement.offsetWidth}px`;
    clone.style.height = "auto";
    clone.style.overflow = "visible";

    // Append the clone to the body
    document.body.appendChild(clone);

    try {
      // Use html2canvas on the clone
      const canvas = await html2canvas(clone, {
        logging: false,
        useCORS: true,
        scale: 2,
        windowWidth: chatElement.scrollWidth,
        windowHeight: clone.scrollHeight,
      });

      // Create PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      return pdf.output("blob");
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    } finally {
      // Remove the clone from the document
      document.body.removeChild(clone);
    }
  };

  const handleSubmit = async () => {
    setIsSubmittingReport(true);
    setReportError(null);
    setReportSuccess(null);

    try {
      setReportError("Capturing conversation... This may take a moment.");
      const pdfBlob = await captureConversationAsPDF();
      if (!pdfBlob) {
        throw new Error("Failed to create PDF");
      }
      setReportError("Conversation captured. Sending report...");

      const formData = new FormData();
      formData.append("visitorId", partnerVisitorId);
      formData.append("reason", reportReason);
      formData.append("pdfReport", pdfBlob, "conversation.pdf");

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_ORIGIN}/api/report-user`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        setReportSuccess(
          "Report sent successfully. You can end the chat if you want."
        );
        setReportError(null); // Clear the "Sending report..." message
        setReportReason(""); // Clear the textarea
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send report.");
      }
    } catch (error) {
      console.error("Error reporting user:", error);
      setReportError(
        `An error occurred: ${error.message}. Please try again or contact support if the issue persists.`
      );
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <div
      ref={sidebarRef}
      className={`sidebar absolute top-0 right-0 h-full bg-[#1f2e3a] shadow-lg transform transition-transform duration-300 ${className} ${
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

        <div className="flex justify-end space-x-4">
          <button
            onClick={handleCancel2}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg"
            disabled={isSubmittingReport}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
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
