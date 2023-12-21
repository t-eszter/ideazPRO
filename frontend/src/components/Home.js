// IdeaGroupList.js
import React, { useEffect, useState } from "react";

const Home = () => {
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
    <div>
      <h2>Idea Groups</h2>
      <ul>
        {ideaGroups.map((group) => (
          <li key={group.id}>{group.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
