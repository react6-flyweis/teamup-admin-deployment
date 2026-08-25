import React, { useState, useRef } from "react";
import UploadIcon from "../../assets/icons/UploadIcon";
import privacyImage from "@/assets/privacy-image.jpg";
import { uploadFile } from "@/utils/fileUpload";

const PrivacyTab = () => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const url = await uploadFile(file);
        setImageUrl(url);
      } catch (error) {
        console.error('File upload failed:', error);
      }
    }
  };

  return (
    <div className="text-white">
      {/* Image Upload */}
      <div className="relative w-full h-[187px] rounded-lg mb-8 overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${imageUrl || privacyImage})`,
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-4 text-white"
          >
            <span className="text-base font-medium font-poppins">Change your photo here</span>
            <UploadIcon />
            <span className="text-xs font-medium font-poppins">Supported file format PNG, JPEG, JPG</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpeg,.jpg"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {/* Headline */}
      <div className="mb-6">
        <h2 className="text-xl font-medium text-white mb-2.5 font-poppins">Headline Goes here...</h2>
        <input
          type="text"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="Our Blogs"
          className="w-full h-12 px-4 rounded-lg bg-white border border-[#AEB4C2] text-[#333333]"
          style={{ fontFamily: "Open Sans" }}
        />
      </div>

      {/* Description */}
      <div className="mb-6">
        <h2 className="text-xl font-medium text-white mb-2.5 font-poppins">Enter description here...</h2>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged."
          className="w-full h-[154px] px-4 py-3 rounded-lg bg-white border border-[#AEB4C2] text-[#333333] resize-none"
          style={{ fontFamily: "Open Sans" }}
        />
      </div>
    </div>
  );
};

export default PrivacyTab;
