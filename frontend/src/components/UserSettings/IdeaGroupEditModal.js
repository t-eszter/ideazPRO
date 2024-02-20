import React, { useState, useEffect } from "react";

function IdeaGroupEditModal({ group, onClose, onEdit }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description);
      setStatus(group.status);
    }
  }, [group]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Perform the update operation here
    // After successful update, call onEdit() to refresh the IdeaGroups list and onClose() to close the modal
  };

  return (
    <div className="modal modal-open fixed w-full h-full top-0 left-0 flex items-center justify-center">
      <div className="modal-overlay absolute w-full h-full bg-gray-900 opacity-50"></div>
      <form onSubmit={handleSubmit}>
        {/* Input fields for name, description, status */}
        {/* Submit button */}
      </form>
      <button onClick={onClose}>Close</button>
    </div>
  );
}

export default IdeaGroupEditModal;
