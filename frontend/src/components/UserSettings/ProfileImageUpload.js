import React, { useState } from "react";
import { Cloudinary } from "@cloudinary/url-gen";

// Initialize the Cloudinary instance with your cloud name
const cld = new Cloudinary({ cloud: { cloudName: "hghmmn6w5" } });

const ProfileImageUpload = () => {
  const [image, setImage] = useState("");

  const uploadImage = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    const file = files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "nufl9tma");

    try {
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cld.cloud.cloudName}/image/upload`;
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload image");
      const data = await response.json();

      setImage(data.secure_url);
      // Call the callback prop
      props.onUploadSuccess(data.secure_url);
      // Optionally, send the image URL to your backend here if you need to associate it with a user profile
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
