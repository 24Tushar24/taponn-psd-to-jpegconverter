"use client";

import { useState, useEffect } from "react";
import {
  IoClose,
  IoDownloadOutline,
  IoShareOutline,
  IoExpandOutline,
  IoContractOutline,
  IoImageOutline,
} from "react-icons/io5";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName: string;
  uploadedAt?: string;
  productType?: string;
}

export default function ImageModal({
  isOpen,
  onClose,
  imageUrl,
  imageName,
  uploadedAt,
  productType,
}: ImageModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Debug logging
  useEffect(() => {
    if (isOpen) {
      console.log("Modal opened with image URL:", imageUrl);
      setImageLoaded(false);
      setImageError(false);
    }
  }, [isOpen, imageUrl]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = imageName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: imageName,
          url: imageUrl,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(imageUrl);
      // You could add a toast notification here
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl transition-all duration-300 flex flex-col ${
          isFullscreen
            ? "w-[95vw] h-[95vh]"
            : "w-[90vw] h-[85vh] max-w-6xl max-h-[800px]"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
              {imageName}
            </h2>
            <div className="flex items-center space-x-4 mt-1">
              {productType && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  {productType
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              )}
              {uploadedAt && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(uploadedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={handleDownload}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              title="Download"
            >
              <IoDownloadOutline className="h-5 w-5" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              title="Share"
            >
              <IoShareOutline className="h-5 w-5" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <IoContractOutline className="h-5 w-5" />
              ) : (
                <IoExpandOutline className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              title="Close"
            >
              <IoClose className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-hidden min-h-0">
          {!imageLoaded && !imageError && (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}

          {imageError ? (
            <div className="flex flex-col items-center justify-center space-y-4 text-gray-500">
              <IoImageOutline className="h-16 w-16" />
              <p>Failed to load image</p>
              <p className="text-sm break-all">{imageUrl}</p>
              <button
                onClick={() => window.open(imageUrl, "_blank")}
                className="text-blue-500 hover:text-blue-700 underline text-sm"
              >
                Try opening in new tab
              </button>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={imageName}
                className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => {
                  console.log("Image loaded successfully:", imageUrl);
                  setImageLoaded(true);
                }}
                onError={() => {
                  console.error("Failed to load image:", imageUrl);
                  setImageError(true);
                }}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  width: "auto",
                  height: "auto",
                }}
              />
            </div>
          )}
        </div>

        {/* Footer with image name */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {imageName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Click outside or press ESC to close
              </p>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              High resolution preview
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
