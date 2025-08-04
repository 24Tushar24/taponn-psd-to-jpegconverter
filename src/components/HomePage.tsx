"use client";

import React, { useState, useRef } from "react";
import FolderView from "@/components/FolderView";
import FloatingUploadButton from "@/components/FloatingUploadButton";
import ImageModal from "@/components/ImageModal";

interface SearchResult {
  id: string;
  name: string;
  type: "image";
  image_url: string;
  uploaded_at: string;
  product_type: string;
  path: string;
  breadcrumbs: Array<{ name: string; path: string }>;
}

export default function HomePage() {
  const [selectedImage, setSelectedImage] = useState<SearchResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const folderViewRef = useRef<{
    navigateToPath: (path: string) => void;
  } | null>(null);

  const handleNavigateToPath = (path: string) => {
    // Navigate to the specific path in FolderView
    folderViewRef.current?.navigateToPath(path);
  };

  const handleImageSelect = (image: SearchResult) => {
    // Open the image in modal
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  return (
    <div className="h-full">
      <FolderView
        ref={folderViewRef}
        onNavigateToPath={handleNavigateToPath}
        onImageSelect={handleImageSelect}
      />
      <FloatingUploadButton />

      {/* Image Modal from Search */}
      {selectedImage && (
        <ImageModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          imageUrl={selectedImage.image_url}
          imageName={selectedImage.name}
          uploadedAt={selectedImage.uploaded_at}
          productType={selectedImage.product_type}
        />
      )}
    </div>
  );
}
