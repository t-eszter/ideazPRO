import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import BASE_URL from "./config";
import NewIdeaForm from "./NewIdeaForm";

const IdeaGroup = () => {
  const [ideaGroups, setIdeaGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [ideas, setIdeas] = useState([]);

  const navigate = useNavigate();
  const { groupSlug } = useParams();

  // NewIdeaForm
  const [showNewIdeaForm, setShowNewIdeaForm] = useState(false);

  const handleNewIdeaAdded = (newIdea) => {
    setIdeas([...ideas, newIdea]);
    setShowNewIdeaForm(false);
  };

  useEffect(() => {
    const fetchIdeaGroups = async () => {
      try {
        const response = await fetch("/api/ideagroups/");
        const data = await response.json();
        setIdeaGroups(data);

        if (data && data.length > 0) {
          // Check if a groupSlug is available in the URL
          if (groupSlug) {
            const foundGroup = data.find((group) => group.slug === groupSlug);
            if (foundGroup) {
              setActiveGroup(foundGroup);
            } else {
              navigate("/"); // Redirect to a default route if no matching group is found
            }
          } else {
            // Optionally, set the first group as active if no groupSlug is in the URL
            setActiveGroup(data[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching idea groups:", error);
      }
    };

    fetchIdeaGroups();
  }, [navigate, groupSlug]);

  useEffect(() => {
    const fetchIdeas = async () => {
      if (activeGroup) {
        try {
          const response = await fetch(
            `/api/ideagroups/${activeGroup.id}/ideas`
          );
          const data = await response.json();
          console.log("Fetched ideas:", data); // To confirm the data structure
          setIdeas(data.ideas); // Extract the 'ideas' array from the response
        } catch (error) {
          console.error("Error fetching ideas:", error);
        }
      }
    };

    fetchIdeas();
  }, [activeGroup]);

  const handleGroupClick = (group) => {
    setActiveGroup(group);
    navigate(`/${group.slug}/`);
  };

  return (
    <div className="h-screen flex flex-col justify-between bg-gray-100">
      {/* Render the ideas grid first */}
      <div className="grid grid-cols-3 gap-4 p-4">
        {Array.isArray(ideas) &&
          ideas.map((idea) => (
            <div
              key={idea.id}
              className="bg-white shadow rounded p-4 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-700">
                  {idea.title}
                </h3>
                <p className="text-gray-600">{idea.description}</p>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-500">
                  Posted by: {idea.user}
                </span>
                <span className="text-sm text-gray-500">
                  Likes: {idea.likes}
                </span>
              </div>
            </div>
          ))}
      </div>

      {/* NewIdeaForm */}
      <button
        className="bg-orange-500 text-white p-3 rounded fixed bottom-4 right-4 shadow-lg"
        onClick={() => setShowNewIdeaForm(true)}
      >
        New Idea
      </button>

      {showNewIdeaForm && (
        <NewIdeaForm
          ideaGroups={ideaGroups}
          activeGroup={activeGroup}
          onNewIdeaAdded={handleNewIdeaAdded}
        />
      )}

      {/* Render the idea groups list, which will stick to the bottom horizontally */}
      <ul className="overflow-y-auto flex justify-around p-4 bg-white shadow">
        {ideaGroups.map((group) => (
          <Link
            to={`/${group.slug}/`}
            key={group.id}
            className={`text-center bg-gray-200 hover:bg-gray-300 ${
              group.id === activeGroup?.id ? "text-orange-500" : "text-gray-700"
            } rounded-lg px-6 py-2 m-1 transition duration-300 ease-in-out`}
            onClick={() => handleGroupClick(group)}
          >
            {group.name}
          </Link>
        ))}
      </ul>
    </div>
  );
};

export default IdeaGroup;
