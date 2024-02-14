//IdeaGroup.js
import React, { useState, useCallback, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import BASE_URL from "./config";
import NewIdeaForm from "./NewIdeaForm";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DraggableIdeaCard from "./DraggableIdeaCard";
import Header from "./Header";
import CSRFToken, { getCookie } from "./csrftoken";
import { useAuth } from "./AuthContext";

const IdeaGroup = () => {
  const { currentUser } = useAuth();

  useEffect(() => {
    console.log("IdeaGroup component mounted.");
  }, []);

  useEffect(() => {
    if (currentUser) {
      // Logic that requires a logged-in user
      console.log("Logged-in user:", currentUser);
    } else {
      // Logic for guests or handling the absence of a logged-in user
      console.log("No user logged in, proceeding as guest...");
    }
  }, [currentUser]);

  const [ideaGroups, setIdeaGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const { organizationName, groupId, groupSlug } = useParams();
  const navigate = useNavigate();

  // Determine the mode based on the URL parameters
  const isGuestUserMode = groupId !== undefined;
  // console.log("Is Guest User Mode:", isGuestUserMode, "Group ID:", groupId);
  const isOrganizationMode = organizationName !== undefined && !isGuestUserMode;

  // NewIdeaForm
  const [showNewIdeaForm, setShowNewIdeaForm] = useState(false);

  const handleNewIdeaAdded = (newIdea) => {
    if (newIdea.group === activeGroup.id) {
      setIdeas([...ideas, newIdea]);
    }
    setShowNewIdeaForm(false);
  };

  const handleCloseForm = () => {
    setShowNewIdeaForm(false);
  };

  const [positions, setPositions] = useState({});

  useEffect(() => {
    if (ideas) {
      const newPositions = ideas.reduce((acc, idea) => {
        acc[idea.id] = { x: 0, y: 0, isMoved: false };
        return acc;
      }, {});
      setPositions(newPositions);
    }
  }, [ideas]);

  const handleMove = useCallback((id, newX, newY) => {
    setPositions((prevPositions) => {
      const currentPos = prevPositions[id] || { x: 0, y: 0, isMoved: false };
      return {
        ...prevPositions,
        [id]: { x: currentPos.x + newX, y: currentPos.y + newY, isMoved: true },
      };
    });
  }, []);

  const [, dropRef] = useDrop({
    accept: "idea",
    drop: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (delta) {
        handleMove(item.id, delta.x, delta.y);
      }
    },
  });

  useEffect(() => {
    const fetchIdeaGroups = async () => {
      let url;

      if (isOrganizationMode) {
        url = `/api/${organizationName}`;
      } else if (isGuestUserMode) {
        url = `/api/group/${groupId}/`;
        // console.log(url);
      } else {
        // console.error("Invalid URL parameters");
        return;
      }

      try {
        const response = await fetch(url);
        const data = await response.json();
        // console.log("Response Data:", data);

        if (isOrganizationMode) {
          setIdeaGroups(data);

          // Set active group based on slug or first group
          if (groupSlug) {
            const activeGroupFromSlug = data.find(
              (group) => group.slug === groupSlug
            );
            setActiveGroup(activeGroupFromSlug || data[0]);
          } else {
            setActiveGroup(data[0]);
          }
        } else if (isGuestUserMode) {
          setActiveGroup(data.group); // Set active group using data about the group
          setIdeaGroups([data.group]); // Optionally set ideaGroups to an array containing only this group
          setIdeas(data.ideas); // Set ideas using data about the ideas
          // console.log(data);
        }
      } catch (error) {
        // console.error("Error fetching idea groups:", error);
      }
    };

    fetchIdeaGroups();
  }, [organizationName, groupId, groupSlug]);

  useEffect(() => {
    const fetchIdeas = async () => {
      if (activeGroup) {
        let url;
        if (isOrganizationMode) {
          url = `/api/${organizationName}/${activeGroup.slug}/ideas`;
        } else if (isGuestUserMode) {
          url = `/api/group/${activeGroup.id}/`;
        } else {
          // console.error("Invalid mode for fetching ideas");
          return;
        }

        try {
          const response = await fetch(url);
          const data = await response.json();
          setIdeas(data.ideas);
        } catch (error) {
          // console.error("Error fetching ideas:", error);
        }
      }
    };
    if (activeGroup) {
      fetchIdeas();
    }
  }, [activeGroup, isOrganizationMode, isGuestUserMode, organizationName]);

  const handleGroupClick = (group) => {
    setActiveGroup(group);
    navigate(`/${organizationName}/${group.slug}/`);
  };

  const handleLike = async (ideaId, increment) => {
    try {
      console.log("Async handleLike called with:", ideaId, increment);
      const csrfToken = getCookie("csrftoken"); // Retrieve the CSRF token
      // console.log("CSRF Token:", csrfToken); // Log the CSRF token

      const formData = new FormData();
      formData.append("increment", increment);

      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await fetch(`/api/group/${ideaId}/like`, {
        method: "PUT",
        headers: {
          "X-CSRFToken": csrfToken, // Include CSRF token in headers
        },
        body: formData,
      });
      // Error handling
      if (!response.ok) {
        throw new Error("Failed to like the idea");
      }

      // Parsing the response
      const updatedIdea = await response.json();

      // Update the idea's likes in the local state
      const updatedIdeas = ideas.map(
        (idea) => (idea.id === ideaId ? updatedIdea : idea) // Use the updated idea from the response
      );
      setIdeas(updatedIdeas);
    } catch (error) {
      // console.error("Error liking the idea:", error);
    }
  };

  return (
    <div className="h-screen">
      <Header />
      <div
        ref={dropRef}
        className="h-screen flex flex-col justify-between relative bg-alabaster-100"
      >
        <div className="columns-4 gap-8 p-12" style={{ columnGap: "1rem" }}>
          {Array.isArray(ideas) &&
            ideas.map((idea) => (
              <div
                key={idea.id}
                className="grid-item mb-8"
                style={{ breakInside: "avoid" }}
              >
                <DraggableIdeaCard
                  idea={idea}
                  position={
                    positions[idea.id] || { x: 0, y: 0, isMoved: false }
                  }
                  onMove={handleMove}
                  onLike={(ideaId, increment) => handleLike(ideaId, increment)}
                />
              </div>
            ))}
        </div>

        {/* NewIdeaForm */}
        <div className="fixed bottom-4 right-4 z-40">
          <button
            className="flex items-center justify-center w-16 h-16 pt-2.5 text-5xl bg-flamingo-500 text-white p-4 rounded-full"
            onClick={() => setShowNewIdeaForm(true)}
          >
            +
          </button>
          <p className="text-flamingo-500">New Idea</p>
        </div>

        {showNewIdeaForm && activeGroup && (
          <NewIdeaForm
            ideaGroups={ideaGroups}
            activeGroup={activeGroup}
            onNewIdeaAdded={handleNewIdeaAdded}
            onClose={handleCloseForm}
          />
        )}

        <ul className="flex justify-left gap-8 py-4 px-8 sticky bottom-0 z-30 bg-alabaster-100">
          {ideaGroups.map((group) => {
            // Check if it's GuestUserMode
            if (isGuestUserMode) {
              return (
                <div
                  key={activeGroup?.id || "guest-group"}
                  className="font-kumbh text-xl text-center text-lochmara-900 bg-white border-lochmara-900 border-2 border-solid hover:bg-lochmara-50 rounded-lg px-6 py-2 m-1 transition duration-300 ease-in-out"
                >
                  {activeGroup?.name}
                </div>
              );
            } else {
              return (
                <Link
                  to={`/${organizationName}/${group.slug}/`}
                  key={group.id}
                  className={`font-kumbh text-xl text-center ${
                    group.id === activeGroup?.id
                      ? "text-white bg-lochmara-900 hover:bg-cerulean-700"
                      : "text-lochmara-900 bg-white border-lochmara-900 border-2 border-solid hover:bg-lochmara-50"
                  } rounded-lg px-6 py-2 m-1 transition duration-300 ease-in-out`}
                  onClick={() => handleGroupClick(group)}
                >
                  {group.name}
                </Link>
              );
            }
          })}
        </ul>
      </div>
    </div>
  );
};

export default IdeaGroup;
