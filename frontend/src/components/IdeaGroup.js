// Import necessary Tailwind CSS classes
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const IdeaGroup = () => {
  const [ideaGroups, setIdeaGroups] = useState([]);

  useEffect(() => {
    const fetchIdeaGroups = async () => {
      try {
        const response = await fetch("api/ideagroups/");
        const data = await response.json();
        setIdeaGroups(data);
      } catch (error) {
        console.error("Error fetching idea groups:", error);
      }
    };

    fetchIdeaGroups();
  }, []);

  return (
    <div className="h-screen flex flex-col justify-between">
      <h2 className="text-2xl mb-4">Idea Groups</h2>
      <ul className="overflow-y-auto">
        {ideaGroups.map((group) => (
          <Link
            to={`/${group.slug}/`}
            key={group.id}
            className="bg-white border-2 border-[#E16C37] rounded-9 p-4 mb-4 block"
          >
            {group.name}
          </Link>
        ))}
      </ul>
    </div>
  );
};

export default IdeaGroup;
