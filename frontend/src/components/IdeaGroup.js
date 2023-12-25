import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const IdeaGroup = () => {
  const [ideaGroups, setIdeaGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIdeaGroups = async () => {
      try {
        const response = await fetch("api/ideagroups/");
        const data = await response.json();
        setIdeaGroups(data);
        // Automatically select the first group as active if available
        if (data && data.length > 0) {
          setActiveGroup(data[0]);
          navigate(`/${data[0].slug}/`);
        }
      } catch (error) {
        console.error("Error fetching idea groups:", error);
      }
    };

    fetchIdeaGroups();
  }, [navigate]);

  useEffect(() => {
    const fetchIdeas = async () => {
      if (activeGroup) {
        try {
          const response = await fetch(
            `/api/ideagroups/${activeGroup.id}/ideas`
          );
          const data = await response.json();
          console.log("Fetched ideas:", data); // Check the structure here
          setIdeas(data); // Or data.ideas if that's the structure
        } catch (error) {
          console.error("Error fetching ideas:", error);
          console.error(error.response);
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
    <div className="h-screen flex flex-col justify-between">
      {/* <h2 className="text-2xl mb-4">Idea Groups</h2> */}
      <ul className="overflow-y-auto">
        {ideaGroups.map((group) => (
          <Link
            to={`/${group.slug}/`}
            key={group.id}
            className={`bg-white border-2 ${
              group.id === activeGroup?.id
                ? "border-blue-500"
                : "border-[#E16C37]"
            } rounded-9 p-4 mb-4 block`}
            onClick={() => handleGroupClick(group)}
          >
            {group.name}
          </Link>
        ))}
      </ul>
      <div className="grid grid-cols-3 gap-4">
        {ideas.map((idea) => (
          <div
            key={idea.id}
            className="bg-white border-2 border-gray-300 rounded p-4"
          >
            <h3 className="text-xl font-bold">{idea.title}</h3>
            <p>{idea.description}</p>
            <span className="text-sm text-gray-500">Likes: {idea.likes}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IdeaGroup;
