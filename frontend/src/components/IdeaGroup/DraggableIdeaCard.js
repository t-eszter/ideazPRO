import React, { useState } from "react";
import { useDrag } from "react-dnd";
import LikeCounter from "./LikeCounter";
import Comments from "./Comments";
import Modal from "../components/Modal";

const DraggableIdeaCard = ({ idea, position, onMove, onLike }) => {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "idea",
    item: { id: idea.id, originalPosition: position },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const clientOffset = monitor.getClientOffset();
      if (item && clientOffset) {
        onMove(item.id, clientOffset.x, clientOffset.y);
      }
    },
  }));

  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderTextWithLinks = (text) => {
    const urlRegex =
      /(\bhttps?:\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;

    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            link
          </a>
        );
      } else {
        return part;
      }
    });
  };

  const cardStyle = {
    opacity: isDragging ? 0.5 : 1,
    transform: `translate(${position.x}px, ${position.y}px)`,
  };

  return (
    <div ref={dragRef} className="flex flex-row">
      <div
        className="flip-card-wrapper rounded  w-64 flex flex-row justify-left z-0"
        style={cardStyle}
      >
        <div className="flip-card h-fit">
          <div className="flip-card-inner h-fit p-5">
            <div className="flip-card-front h-fit">
              <h3 className="text-m font-semibold text-gray-700 pb-2">
                {idea.title}
              </h3>
              <p className="text-gray-600 text-sm leading-5">
                {renderTextWithLinks(idea.description)}
                {}
              </p>
            </div>
            <div className="flip-card-back h-fit flex flex-col">
              <span className="text-sm text-gray-500">
                Posted by:
                <br />
                <span className="font-semibold text-black">
                  {idea.posted_by}
                </span>
              </span>
              <span className="text-sm text-gray-500 pt-2">
                Posted on:
                <br />
                <span className="font-semibold text-black">
                  {formatDate(idea.postedDate)}
                </span>
              </span>
              <a
                href="#"
                onClick={toggleModal}
                className="text-blue-600 hover:underline cursor-pointer"
              >
                Comments
              </a>
            </div>
            <Modal isOpen={isModalOpen} onClose={toggleModal}>
              <Comments ideaId={idea.id} title={idea.title} />
            </Modal>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between text-center z-30">
        <LikeCounter ideaId={idea.id} onLike={onLike} />
      </div>
    </div>
  );
};

export default DraggableIdeaCard;
