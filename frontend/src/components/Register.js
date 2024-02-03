import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getCookie } from "./csrftoken";
import Login from "./Login";

function Register({ isOpen, toggleRegister }) {
  const [formData, setFormData] = useState({
    user: {
      username: "",
      email: "",
      password: "",
    },
    firstName: "",
    lastName: "",
    organization_name: "", // Assuming you handle organization through name
  });

  const { groupId } = useParams();

  useEffect(() => {
    if (groupId) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        idea_group_id: groupId,
      }));
    }
    const checkLoginStatus = () => {
      // Example: Check if a user token exists and is valid
      const token = localStorage.getItem("userToken");
      if (token) {
        // Assume the token is valid for this example
        setIsLoggedIn(true);
        // Set user information if available
        setUser({ name: "User Name" }); // Replace with actual user data
      }
    };
    checkLoginStatus();
  }, [groupId]);

  const handleChange = (e) => {
    if (e.target.name in formData.user) {
      setFormData({
        ...formData,
        user: { ...formData.user, [e.target.name]: e.target.value },
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const [errors, setErrors] = useState({});
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track if user is logged in
  const [user, setUser] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({}); // Reset error messages

    console.log("Submitting formData:", formData); // This should include idea_group_id if set

    fetch("/api/register/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"), // Ensure CSRF token is included
      },
      body: JSON.stringify({
        ...formData,
        idea_group_id: groupId, // Assuming your backend handles this field.
      }),
    })
      .then((response) =>
        response.json().then((data) => ({
          status: response.status,
          body: data,
        }))
      )
      .then(({ status, body }) => {
        if (status >= 400 && status < 600) {
          setErrors(body);
          console.error("Registration failed:", body);
        } else {
          console.log("Registration successful:", body);
          setIsRegistered(true);
          setFormData({
            user: {
              username: "",
              email: "",
              password: "",
            },
            firstName: "",
            lastName: "",
            organization_name: "",
          });
          setErrors({});
        }
      })
      .catch((error) => {
        console.error("Network or other error:", error);
        setErrors({
          non_field_errors: [
            "A network or server error occurred. Please try again.",
          ],
        });
      });
  };

  if (!isOpen) return null;

  if (isLoggedIn) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="flex justify-center items-center h-full">
          <div className="bg-white p-5 rounded-lg shadow-lg w-1/3">
            <button onClick={toggleRegister} className="float-right">
              X
            </button>
            <h2 className="text-center text-2xl mb-4">Welcome, {user.name}</h2>
            <button
              onClick={handleLogout}
              className="w-full p-2 bg-blue-500 text-white"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isRegistered) {
    // Display the Login component or a success message after registration
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="flex justify-center items-center h-full">
          <div className="bg-white p-5 rounded-lg shadow-lg w-1/3">
            <button onClick={toggleRegister} className="float-right">
              X
            </button>
            <h2 className="text-center text-2xl mb-4">
              Registration successful, now you can log in
            </h2>
            <Login />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="flex justify-center items-center h-full">
        <div className="bg-white p-5 rounded-lg shadow-lg w-1/3">
          <button onClick={toggleRegister} className="float-right">
            X
          </button>
          <form onSubmit={handleSubmit}>
            <h2 className="text-center text-2xl mb-4">Register</h2>
            <input
              type="hidden"
              name="idea_group_id"
              value={formData.idea_group_id} // Ensure this is set based on your app's logic
            />

            <input
              type="text"
              name="organization_name"
              value={formData.organization_name}
              onChange={handleChange}
              placeholder="Group or Organization"
              className="block w-full p-2 mb-4"
            />
            {errors.organization_name && (
              <div className="text-red-500">
                {errors.organization_name.join(" ")}
              </div>
            )}
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
              className="block w-full p-2 mb-4"
            />
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              className="block w-full p-2 mb-4"
            />
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="block w-full p-2 mb-4"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="block w-full p-2 mb-4"
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="block w-full p-2 mb-4"
            />
            <button type="submit" className="w-full p-2 bg-blue-500 text-white">
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
