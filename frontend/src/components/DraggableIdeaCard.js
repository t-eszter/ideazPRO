import React from "react";
import { useDrag } from "react-dnd";

const DraggableIdeaCard = ({ idea, position, onMove }) => {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "idea",
    item: { id: idea.id, originalPosition: position },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const clientOffset = monitor.getClientOffset();
      if (item && clientOffset) {
        // Directly use clientX and clientY for positioning
        onMove(item.id, clientOffset.x, clientOffset.y);
      }
    },
  }));

  const formatDate = (dateString) => {
    // Ensure dateString is valid and not undefined
    if (!dateString) return "";

    // Create a Date object from the dateString
    const date = new Date(dateString);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    // Format the date
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true, // Optional: Use 12-hour format
    });
  };

  const cardStyle = {
    opacity: isDragging ? 0.5 : 1,
    transform: `translate(${position.x}px, ${position.y}px)`,
  };

  return (
    <div
      ref={dragRef}
      className="flip-card-wrapper rounded p-4 w-72 flex flex-col justify-left "
      style={cardStyle}
    >
      <div className="flip-card h-fit">
        <div className="flip-card-inner h-fit p-6">
          <div className="flip-card-front h-fit">
            <h3 className="text-lg font-semibold text-gray-700">
              {idea.title}
            </h3>
            <p className="text-gray-600">{idea.description}</p>
          </div>
          <div className="flip-card-back h-fit flex flex-col">
            <span className="text-sm text-gray-500">
              Posted by: <br /> {idea.user || "Anonymous"}
            </span>
            <span className="text-sm text-gray-500">
              Posted on: <br /> {formatDate(idea.postedDate)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraggableIdeaCard;
