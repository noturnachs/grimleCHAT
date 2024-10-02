import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";

const Ads = ({ isModalOpen, onClose }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const shareLink = `https://leeyos.com/#announcements`;
  const [showMetaTags, setShowMetaTags] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title:
            "We would greatly appreciate your participation in our brief survey for our Probability and Statistics project",
          text: "Check out this announcement on LeeyosChat!",
          url: shareLink,
        })
        .then(() => console.log("Share successful"))
        .catch((error) => console.error("Error sharing:", error));
    } else {
      navigator.clipboard
        .writeText(shareLink)
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch((error) => {
          console.error("Error copying link:", error);
        });
    }
  };

  // Check if the URL contains #announcements
  const isAnnouncementsPage = window.location.hash === "#announcements";

  useEffect(() => {
    // Show meta tags when the modal is open
    if (isModalOpen) {
      setShowMetaTags(true);
    } else {
      setShowMetaTags(false);
    }
  }, [isModalOpen]);

  return (
    <>
      {isAnnouncementsPage && showMetaTags && (
        <Helmet>
          <title>
            We would greatly appreciate your participation in our brief survey
            for our Probability and Statistics project
          </title>
          <meta
            property="og:title"
            content="We would greatly appreciate your participation in our brief survey for our Probability and Statistics project"
          />
          <meta
            property="og:description"
            content="Your insights are essential to our research. Participate in our brief survey!"
          />
          <meta property="og:url" content={shareLink} />
          <meta property="og:image" content="URL_to_an_image" />{" "}
          {/* Optional: Add an image URL for the preview */}
        </Helmet>
      )}

      {/* Permanent Announcement Content */}
      <div className="bg-[#fbbf16] p-3 rounded-lg mt-10 shadow-lg max-w-md w-full">
        <div className="bg-white p-4 rounded-lg mt-4 border-l-4 border-[#10ae4d] shadow-lg">
          <h2 className="text-xl font-bold text-[#11a7e0]">
            To: <span className="text-[#ff0d00]">All Carolinians</span>
          </h2>
          <p className="text-sm text-[#007638]">
            Good day! We would greatly appreciate your participation in our
            brief survey for our Probability and Statistics project—your
            insights are essential to our research. Thanks!
          </p>
          <div className="mt-4">
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLScaNHHvyI_QcwLVT37f_cOIgBsJqU62rWUxajblwyli38SEUw/formResponse"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#11a7e0] text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-[#10ae4d] transition-colors"
            >
              Participate in the Survey
            </a>
          </div>
          <div className="mt-4">
            <button
              onClick={handleShare}
              className="inline-block bg-[#10ae4d] text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-[#11a7e0] transition-colors"
            >
              Share Link
            </button>
            {copySuccess && (
              <span className="ml-2 text-green-600 text-sm">
                Link copied to clipboard!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Modal Popup (only when isModalOpen is true) */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-[#fbbf16] p-6 rounded-lg shadow-lg max-w-md w-full relative z-60">
            <button
              onClick={() => {
                onClose();
                setShowMetaTags(false); // Remove meta tags when modal is closed
              }}
              className="absolute top-2 right-2 text-gray-500"
            >
              &times;
            </button>
            <div className="bg-[#fbbf16] p-3 rounded-lg mt-10 shadow-lg max-w-md w-full">
              <div className="bg-white p-4 rounded-lg mt-4 border-l-4 border-[#10ae4d] shadow-lg">
                <h2 className="text-xl font-bold text-[#11a7e0]">
                  To: <span className="text-[#ff0d00]">All Carolinians</span>
                </h2>
                <p className="text-sm text-[#007638]">
                  Good day! We would greatly appreciate your participation in
                  our brief survey for our Probability and Statistics
                  project—your insights are essential to our research. Thanks!
                </p>
                <div className="mt-4">
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLScaNHHvyI_QcwLVT37f_cOIgBsJqU62rWUxajblwyli38SEUw/formResponse"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-[#11a7e0] text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-[#10ae4d] transition-colors"
                  >
                    Participate in the Survey
                  </a>
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleShare}
                    className="inline-block bg-[#10ae4d] text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-[#11a7e0] transition-colors"
                  >
                    Share Link
                  </button>
                  {copySuccess && (
                    <span className="ml-2 text-green-600 text-sm">
                      Link copied to clipboard!
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Ads;
