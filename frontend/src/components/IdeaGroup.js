//IdeaGroup.js
import React, { useState, useCallback, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import BASE_URL from "./config";
import NewIdeaForm from "./NewIdeaForm";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DraggableIdeaCard from "./DraggableIdeaCard";

const IdeaGroup = () => {
  const [ideaGroups, setIdeaGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const { organizationName } = useParams();

  const navigate = useNavigate();
  const { groupSlug } = useParams();

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
      try {
        const response = await fetch(`/api/${organizationName}`);
        const data = await response.json();
        setIdeaGroups(data);

        // Automatically set the first group as active if it exists
        const activeGroupFromSlug = data.find(
          (group) => group.slug === groupSlug
        );
        setActiveGroup(activeGroupFromSlug || data[0]);
      } catch (error) {
        console.error("Error fetching idea groups:", error);
      }
    };

    fetchIdeaGroups();
  }, [organizationName, groupSlug]);

  useEffect(() => {
    const fetchIdeas = async () => {
      if (activeGroup) {
        try {
          const response = await fetch(
            `/api/${organizationName}/${activeGroup.slug}/ideas`
          );
          const data = await response.json();
          setIdeas(data.ideas);
        } catch (error) {
          console.error("Error fetching ideas:", error);
        }
      }
    };

    if (activeGroup) {
      fetchIdeas();
    }
  }, [activeGroup, organizationName]);

  const handleGroupClick = (group) => {
    setActiveGroup(group);
    navigate(`/${organizationName}/${group.slug}/`);
  };

  return (
    <div
      ref={dropRef}
      className="h-screen flex flex-col justify-between relative bg-alabaster-100"
    >
      <div className="flex flex-row flex-wrap p-12 gap-8">
        {Array.isArray(ideas) &&
          ideas.map((idea) => (
            <DraggableIdeaCard
              key={idea.id}
              idea={idea}
              position={positions[idea.id] || { x: 0, y: 0, isMoved: false }}
              onMove={handleMove}
            />
          ))}
      </div>

      {/* NewIdeaForm */}
      <div className="fixed bottom-4 right-4">
        <button
          className="flex items-center justify-center w-16 h-16 pt-2.5 text-5xl bg-flamingo-500 text-white p-4 rounded-full"
          onClick={() => setShowNewIdeaForm(true)}
        >
          +
        </button>
        <p className="text-flamingo-500">New Idea</p>
      </div>

      {showNewIdeaForm && (
        <NewIdeaForm
          ideaGroups={ideaGroups}
          activeGroup={activeGroup}
          onNewIdeaAdded={handleNewIdeaAdded}
          onClose={handleCloseForm}
        />
      )}

      <ul className="overflow-y-auto flex justify-left gap-8 m-8">
        {ideaGroups.map((group) => (
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
        ))}
      </ul>
    </div>
  );
};

export default IdeaGroup;
