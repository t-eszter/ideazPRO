import React, { useEffect, useState } from "react";
import { useAuth } from "../Authentication/AuthContext";

function HallOfFameModal({ toggleModal }) {
  const [topUsers, setTopUsers] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchTopUsers = async () => {
      const response = await fetch(
        `/api/hall-of-fame/${currentUser.organizationId}`
      );
      const data = await response.json();
      setTopUsers(data.topUsers);
    };

    fetchTopUsers();
  }, [currentUser.organizationId]);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      {}
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Hall of Fame
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Top contributors of {currentUser.organizationName}
            </p>
            <ul className="list-disc list-inside">
              {topUsers.map((user, index) => (
                <li key={index}>
                  {user.name} - {user.points} points
                </li>
              ))}
            </ul>
          </div>
          <div className="items-center px-4 py-3">
            <button
              id="ok-btn"
              className="px-4 py-2 bg-gray-800 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              onClick={toggleModal}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HallOfFameModal;
