import React, { useEffect, useState } from "react";
import { useAuth } from "../Authentication/AuthContext";

const defaultProfilePic = "/images/profile_pics/profile_pic_anon.svg";

function HallOfFameModal({ toggleModal }) {
  const [topUsers, setTopUsers] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchTopUsers = async () => {
      const response = await fetch(
        `/api/hall-of-fame/${currentUser.organizationId}`
      );
      const data = await response.json();
      setTopUsers(data.topUsers.slice(0, 7));
    };

    fetchTopUsers();
  }, [currentUser.organizationId]);

  return (
    <div className="mt-3 text-center">
      <h3 className="text-xl leading-6 font-medium text-gray-900">
        Hall of Fame
      </h3>
      <div className="mt-2">
        <p className="text-sm text-gray-500">
          Top contributors of {currentUser.organizationName}
        </p>
        <ul className="flex flex-col items-center justify-center list-inside pt-8">
          {topUsers.map((user, index) => (
            <li
              key={index}
              className="flex items-center justify-center pb-4 w-full"
            >
              <img
                src={user.profilePic || defaultProfilePic}
                alt={user.name}
                className="h-10 w-10 mr-2 rounded-full object-cover"
              />
              <span>
                {user.name} - {user.points} points
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default HallOfFameModal;
