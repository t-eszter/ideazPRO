import React, { useState, useCallback, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import NewIdeaForm from "./NewIdeaForm";
import { useDrop } from "react-dnd";
import DraggableIdeaCard from "./DraggableIdeaCard";
import Header from "../components/Header";
import { getCookie } from "../Authentication/csrftoken";
import { useAuth } from "../Authentication/AuthContext";

const IdeaGroup = () => {
  const { currentUser } = useAuth();

  const [ideaGroups, setIdeaGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const { organizationName, groupId, groupSlug } = useParams();
  const navigate = useNavigate();

  const isGuestUserMode = groupId !== undefined;
  const isOrganizationMode = organizationName !== undefined && !isGuestUserMode;

  const [showNewIdeaForm, setShowNewIdeaForm] = useState(false);

  const handleNewIdeaAdded = (newIdea) => {
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
      } else {
        return;
      }

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (isOrganizationMode) {
          const filteredIdeaGroups = data.filter(
            (group) => group.status === "active" || group.status === "closed"
          );

          setIdeaGroups(filteredIdeaGroups);

          const activeGroupFromSlug = filteredIdeaGroups.find(
            (group) => group.slug === groupSlug
          );
          setActiveGroup(activeGroupFromSlug || filteredIdeaGroups[0]);
        } else if (isGuestUserMode) {
          setActiveGroup(data.group);
          setIdeaGroups([data.group]);
          setIdeas(data.ideas);
        }
      } catch (error) {
        console.error("Error fetching idea groups:", error);
      }
    };

    fetchIdeaGroups();
  }, [
    organizationName,
    groupId,
    groupSlug,
    isOrganizationMode,
    isGuestUserMode,
  ]);

  const fetchIdeas = async () => {
    if (!activeGroup) return;

    let url = `/api/${organizationName}/${activeGroup.slug}/ideas`;
    if (isGuestUserMode) {
      url = `/api/group/${activeGroup.id}/`;
    }

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setIdeas(data.ideas);
    } catch (error) {
      console.error("Error fetching ideas:", error);
    }
  };

  useEffect(() => {
    if (activeGroup) {
      fetchIdeas();
    }
  }, [activeGroup, isOrganizationMode, isGuestUserMode, organizationName]);

  const handleGroupClick = (group) => {
    setActiveGroup(group);
    navigate(`/${organizationName}/${group.slug}/`);
  };

  return (
    <div className="h-screen">
      <Header />
      <div
        ref={dropRef}
        className="h-screen flex flex-col justify-between relative bg-alabaster-100"
      >
        <div className="columns-4 gap-8 p-8 relative">
          {" "}
          {/* Ensure this is relative */}
          {Array.isArray(ideas) &&
            ideas.map((idea) => (
              <div
                key={idea.id}
                className="grid-item mb-8"
                style={{ breakInside: "avoid" }}
              >
                <DraggableIdeaCard
                  isLoggedIn={!!currentUser}
                  idea={idea}
                  position={
                    positions[idea.id] || { x: 0, y: 0, isMoved: false }
                  }
                  onMove={handleMove}
                />
              </div>
            ))}
          {activeGroup &&
            activeGroup.status === "closed" &&
            activeGroup.comment && (
              <div className="fixed w-80 text-black text-md text-semibold right-0 bottom-20 mt-8 mr-8 px-6 py-4 bg-flamingo-50 shadow-lg rounded-md z-50">
                <p className="text-sm text-gray-700">{activeGroup.comment}</p>
              </div>
            )}
        </div>

        {}
        <div className="fixed bottom-4 right-4 z-40">
          {activeGroup && activeGroup.status !== "closed" && (
            <button
              className="flex items-center justify-center w-16 h-16 pt-2.5 text-5xl bg-flamingo-500 text-white p-4 rounded-full"
              onClick={() => setShowNewIdeaForm(true)}
            >
              +
            </button>
          )}
          {activeGroup && activeGroup.status !== "closed" && (
            <p className="text-flamingo-500">New Idea</p>
          )}
        </div>

        {showNewIdeaForm && activeGroup && (
          <NewIdeaForm
            ideaGroups={ideaGroups}
            activeGroup={activeGroup}
            fetchIdeas={fetchIdeas}
            onNewIdeaAdded={handleNewIdeaAdded}
            onClose={handleCloseForm}
          />
        )}

        <ul className="flex justify-left gap-8 py-4 px-8 sticky bottom-0 z-30 bg-alabaster-100/50">
          {ideaGroups.map((group) => {
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
              const isClosed = group.status === "closed";
              return (
                <Link
                  to={`/${organizationName}/${group.slug}/`}
                  key={group.id}
                  className={`font-kumbh text-xl text-center ${
                    group.id === activeGroup?.id
                      ? "text-white bg-lochmara-900 hover:bg-cerulean-700"
                      : "text-lochmara-900 bg-white border-lochmara-900 border-2 border-solid hover:bg-lochmara-50"
                  } rounded-lg px-6 py-2 m-1 transition duration-300 ease-in-out ${
                    group.status === "closed" ? "line-through" : ""
                  }`}
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
