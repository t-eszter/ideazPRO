import React, { useState } from "react";

const ProfileImageUpload = ({ onUploadSuccess }) => {
  const [image, setImage] = useState("");

  const uploadImage = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    const file = files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "nufl9tma");

    try {
      // Directly use your cloud name here
      const uploadUrl = `https://api.cloudinary.com/v1_1/hghmmn6w5/image/upload`;
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload image");
      const data = await response.json();

      setImage(data.secure_url);
      // Make sure to check if onUploadSuccess is provided and is a function
      if (onUploadSuccess && typeof onUploadSuccess === "function") {
        onUploadSuccess(data.secure_url);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <div>
      <input type="file" onChange={uploadImage} />
      {image && (
        <div>
          <img
            src={image}
            alt="Uploaded Profile"
            style={{ width: "100px", height: "100px", objectFit: "cover" }}
          />
        </div>
      )}
    </div>
  );
};

export default ProfileImageUpload;
