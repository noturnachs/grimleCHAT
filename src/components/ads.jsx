import React from "react";

const Ads = () => {
  return (
    <div className="bg-[#fbbf16] p-3 rounded-lg mt-10 shadow-lg max-w-md w-full md:p-8">
      <div className="bg-white p-4 rounded-lg mt-4 border-l-4 border-[#10ae4d] shadow-lg transition-transform transform hover:scale-105">
        <h2 className="text-xl font-bold text-[#11a7e0]">
          To: <span className="text-[#ff0d00]">All Carolinians</span>
        </h2>
        <p className="text-sm text-[#007638]">
          Good day! We would greatly appreciate your participation in our brief
          survey for our Probability and Statistics project—your insights are
          essential to our research. Thanks!
        </p>
        {/* Google Forms Button */}
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
      </div>
    </div>
  );
};

export default Ads;
