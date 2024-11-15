import React, { useState, useEffect } from "react";
import { socket } from "../socket";

const SERVER_ORIGIN = process.env.REACT_APP_SERVER_ORIGIN;

function Survey() {
  const [hasVoted, setHasVoted] = useState(false);
  const [currentVote, setCurrentVote] = useState(null);
  const [votes, setVotes] = useState({ yes: 0, no: 0 });
  const [loading, setLoading] = useState(true);
  const [isChangingVote, setIsChangingVote] = useState(false);

  useEffect(() => {
    const checkVoteStatus = async () => {
      const visitorId = localStorage.getItem("visitorId");
      if (!visitorId) return;

      try {
        const response = await fetch(`${SERVER_ORIGIN}/api/check-vote`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ visitorId }),
        });
        const data = await response.json();
        setHasVoted(data.hasVoted);
        setCurrentVote(data.currentVote); // Store the user's current vote
        setVotes(data.votes);
        setLoading(false);
      } catch (error) {
        console.error("Error checking vote status:", error);
        setLoading(false);
      }
    };

    checkVoteStatus();

    socket.on("voteUpdate", (newVotes) => {
      setVotes(newVotes);
    });

    return () => {
      socket.off("voteUpdate");
    };
  }, []);

  const handleVote = async (choice) => {
    const visitorId = localStorage.getItem("visitorId");
    if (!visitorId) return;

    try {
      const response = await fetch(`${SERVER_ORIGIN}/api/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          visitorId,
          choice,
          isChange: hasVoted, // Add flag to indicate if this is a vote change
        }),
      });

      if (response.ok) {
        setHasVoted(true);
        setCurrentVote(choice);
        setIsChangingVote(false);
        const data = await response.json();
        setVotes(data.votes);
      }
    } catch (error) {
      console.error("Error submitting vote:", error);
    }
  };

  const totalVotes = votes.yes + votes.no;
  const yesPercentage = totalVotes > 0 ? (votes.yes / totalVotes) * 100 : 0;
  const noPercentage = totalVotes > 0 ? (votes.no / totalVotes) * 100 : 0;

  if (loading) return null;

  return (
    <div className="bg-[#15202b] p-6 rounded-lg shadow-lg max-w-md w-full mb-6 border border-gray-700/30">
      <h2 className="text-xl font-bold text-white mb-4">Community Survey</h2>
      <p className="text-gray-300 mb-4">
        Should we allow sending videos in chat?
      </p>

      {!hasVoted || isChangingVote ? (
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => handleVote("yes")}
            className={`flex-1 ${
              currentVote === "yes"
                ? "bg-green-600 ring-2 ring-green-400"
                : "bg-green-500 hover:bg-green-600"
            } text-white font-bold py-2 px-4 rounded transition-colors`}
          >
            Yes
          </button>
          <button
            onClick={() => handleVote("no")}
            className={`flex-1 ${
              currentVote === "no"
                ? "bg-red-600 ring-2 ring-red-400"
                : "bg-red-500 hover:bg-red-600"
            } text-white font-bold py-2 px-4 rounded transition-colors`}
          >
            No
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative pt-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold inline-block text-green-400">
                Yes ({votes.yes} votes)
              </span>
              <span className="text-xs font-semibold inline-block text-green-400">
                {yesPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="overflow-hidden h-2 text-xs flex rounded bg-green-200">
              <div
                style={{ width: `${yesPercentage}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-500"
              />
            </div>
          </div>

          <div className="relative pt-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold inline-block text-red-400">
                No ({votes.no} votes)
              </span>
              <span className="text-xs font-semibold inline-block text-red-400">
                {noPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="overflow-hidden h-2 text-xs flex rounded bg-red-200">
              <div
                style={{ width: `${noPercentage}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500 transition-all duration-500"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mt-4">
        <p className="text-gray-400 text-sm">Total votes: {totalVotes}</p>
        {hasVoted && !isChangingVote && (
          <button
            onClick={() => setIsChangingVote(true)}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Change Vote
          </button>
        )}
      </div>
      {currentVote && !isChangingVote && (
        <p className="text-gray-400 text-sm mt-2">
          Your vote:{" "}
          <span
            className={
              currentVote === "yes" ? "text-green-400" : "text-red-400"
            }
          >
            {currentVote === "yes" ? "Yes" : "No"}
          </span>
        </p>
      )}
    </div>
  );
}

export default Survey;
