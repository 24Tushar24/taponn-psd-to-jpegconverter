"use client";

import React, { useState } from "react";
import {
  IoAdd,
  IoClose,
  IoCloudUpload,
  IoCheckmark,
  IoAlert,
} from "react-icons/io5";

// Extend window interface for global navigation function
declare global {
  interface Window {
    navigateToFolder?: (path: string) => void;
  }
}

// Base product types as constants
const BASE_PRODUCT_TYPES = ["metal_cards", "nfc_cards", "standees"] as const;
type ProductType = (typeof BASE_PRODUCT_TYPES)[number];

interface UploadStatus {
  [key: string]: {
    progress: number;
    status: "uploading" | "success" | "error";
    message: string;
  };
}

export default function FloatingUploadButton() {
  const [isHovered, setIsHovered] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedProductType, setSelectedProductType] =
    useState<ProductType>("metal_cards");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUploadProgress, setShowUploadProgress] = useState(false);
  const [isProgressMinimized, setIsProgressMinimized] = useState(false);
  const [totalSize, setTotalSize] = useState(0);

  // File size limits
  const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1GB per file
  const MAX_TOTAL_SIZE = 5 * 1024 * 1024 * 1024; // 5GB total

  const handleUpload = () => {
    setIsDialogOpen(true);
  };

  const validateFiles = (files: File[], existingFiles: File[] = []) => {
    const errors: string[] = [];
    const allFiles = [...existingFiles, ...files];

    // Check individual file size limits
    const oversizedFiles = files.filter((file) => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      errors.push(
        `${oversizedFiles.length} file(s) exceed 1GB limit: ${oversizedFiles
          .map((f) => f.name)
          .join(", ")}`
      );
    }

    // Check total size limit
    const totalSize = allFiles.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      errors.push(
        `Total size (${formatFileSize(totalSize)}) exceeds 5GB limit`
      );
    }

    return { isValid: errors.length === 0, errors, totalSize };
  };

  const updateTotalSize = (files: File[]) => {
    const newTotalSize = files.reduce((sum, file) => sum + file.size, 0);
    setTotalSize(newTotalSize);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);

      setSelectedFiles((prev) => {
        // Filter out duplicates based on name and size
        const existingFileKeys = prev.map((f) => `${f.name}-${f.size}`);
        const uniqueNewFiles = newFiles.filter(
          (f) => !existingFileKeys.includes(`${f.name}-${f.size}`)
        );

        // Validate file sizes
        const validation = validateFiles(uniqueNewFiles, prev);

        if (!validation.isValid) {
          // Show error messages
          validation.errors.forEach((error) => {
            alert(error); // You can replace this with a toast notification
          });
          // Return only valid files that fit within limits
          const validFiles = uniqueNewFiles.filter((file) => {
            const tempValidation = validateFiles([file], prev);
            return tempValidation.isValid;
          });
          const updatedFiles = [...prev, ...validFiles];
          updateTotalSize(updatedFiles);
          return updatedFiles;
        }

        const updatedFiles = [...prev, ...uniqueNewFiles];
        updateTotalSize(updatedFiles);
        return updatedFiles;
      });
    }
    // Reset the input value to allow selecting the same file again if needed
    event.target.value = "";
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files) {
      const imageFiles = Array.from(files).filter((file) =>
        file.type.startsWith("image/")
      );

      setSelectedFiles((prev) => {
        // Filter out duplicates based on name and size
        const existingFileKeys = prev.map((f) => `${f.name}-${f.size}`);
        const uniqueNewFiles = imageFiles.filter(
          (f) => !existingFileKeys.includes(`${f.name}-${f.size}`)
        );

        // Validate file sizes
        const validation = validateFiles(uniqueNewFiles, prev);

        if (!validation.isValid) {
          // Show error messages
          validation.errors.forEach((error) => {
            alert(error); // You can replace this with a toast notification
          });
          // Return only valid files that fit within limits
          const validFiles = uniqueNewFiles.filter((file) => {
            const tempValidation = validateFiles([file], prev);
            return tempValidation.isValid;
          });
          const updatedFiles = [...prev, ...validFiles];
          updateTotalSize(updatedFiles);
          return updatedFiles;
        }

        const updatedFiles = [...prev, ...uniqueNewFiles];
        updateTotalSize(updatedFiles);
        return updatedFiles;
      });
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((files) => {
      const updatedFiles = files.filter((_, i) => i !== index);
      updateTotalSize(updatedFiles);
      return updatedFiles;
    });
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setShowUploadProgress(true);
    setIsDialogOpen(false); // Close the main dialog

    const newUploadStatus: UploadStatus = {};

    // Initialize upload status for all files
    selectedFiles.forEach((file, index) => {
      newUploadStatus[`${file.name}-${index}`] = {
        progress: 0,
        status: "uploading",
        message: "Starting upload...",
      };
    });
    setUploadStatus(newUploadStatus);

    try {
      // Create FormData with all files at once
      const formData = new FormData();

      // Append all files to the 'files' field (as expected by the API)
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      // Append product type
      formData.append("product_type", selectedProductType);

      // Simulate progress updates for all files
      const progressInterval = setInterval(() => {
        setUploadStatus((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((fileKey) => {
            if (updated[fileKey].status === "uploading") {
              updated[fileKey] = {
                ...updated[fileKey],
                progress: Math.min(updated[fileKey].progress + 10, 90),
              };
            }
          });
          return updated;
        });
      }, 200);

      const response = await fetch("https://converter-backend-production.up.railway.app/product/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (response.ok) {
        await response.json();
        // Update all files as successful
        setUploadStatus((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((fileKey) => {
            updated[fileKey] = {
              progress: 100,
              status: "success",
              message: "Upload successful!",
            };
          });
          return updated;
        });

        // Refresh the folder view after successful upload
        if (typeof window !== "undefined" && window.navigateToFolder) {
          // Get current path from URL or use empty for home
          const currentPath = window.location.pathname.includes("/")
            ? window.location.pathname.split("/").pop() || ""
            : "";

          // Refresh current folder to show new uploads
          setTimeout(() => {
            if (window.navigateToFolder) {
              window.navigateToFolder(currentPath);
            }
          }, 1000); // Small delay to allow backend processing
        }

        // Auto-hide progress modal after successful upload
        setTimeout(() => {
          setShowUploadProgress(false);
          resetDialog();
        }, 3000); // Hide after 3 seconds to show success message
      } else {
        const error = await response.text();
        // Update all files as failed
        setUploadStatus((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((fileKey) => {
            updated[fileKey] = {
              progress: 0,
              status: "error",
              message: `Upload failed: ${error}`,
            };
          });
          return updated;
        });
      }
    } catch (error) {
      // Update all files as failed
      setUploadStatus((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((fileKey) => {
          updated[fileKey] = {
            progress: 0,
            status: "error",
            message: `Upload failed: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          };
        });
        return updated;
      });
    }

    setIsUploading(false);
  };

  const resetDialog = () => {
    setSelectedFiles([]);
    setUploadStatus({});
    setIsUploading(false);
    setSelectedProductType("metal_cards");
    setIsDragOver(false);
    setShowUploadProgress(false);
    setIsProgressMinimized(false);
    setTotalSize(0);
  };

  const closeDialog = () => {
    if (!isUploading) {
      setIsDialogOpen(false);
      resetDialog();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={handleUpload}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 z-50 group"
        aria-label="Upload files"
      >
        <IoAdd
          className={`w-6 h-6 transition-transform duration-300 ${
            isHovered ? "rotate-90" : ""
          }`}
        />
        {isHovered && (
          <span className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-sm px-3 py-1 rounded-lg whitespace-nowrap">
            Upload Files
          </span>
        )}
      </button>

      {/* Upload Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <IoCloudUpload className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Upload Files
                </h2>
              </div>
              {!isUploading && (
                <button
                  onClick={closeDialog}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <IoClose className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Product Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Type
                </label>
                <select
                  value={selectedProductType}
                  onChange={(e) =>
                    setSelectedProductType(e.target.value as ProductType)
                  }
                  disabled={isUploading}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {BASE_PRODUCT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              {/* File Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Files
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                    isDragOver
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-gray-600"
                  } ${isUploading ? "opacity-50" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={isUploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="text-center">
                    <IoCloudUpload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span className="font-medium text-blue-600">
                        Click to upload
                      </span>{" "}
                      or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      PNG, JPG, GIF - Max 1GB per file, 5GB total
                    </p>
                  </div>
                </div>
              </div>

              {/* Selected Files List */}
              {selectedFiles.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Selected Files ({selectedFiles.length})
                    </h3>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`text-xs ${
                          totalSize > MAX_TOTAL_SIZE * 0.9
                            ? "text-red-600 dark:text-red-400 font-medium"
                            : totalSize > MAX_TOTAL_SIZE * 0.7
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        Total: {formatFileSize(totalSize)} / 5GB
                      </span>
                      {!isUploading && (
                        <button
                          onClick={() => {
                            setSelectedFiles([]);
                            setTotalSize(0);
                          }}
                          className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Total Size Progress Bar */}
                  {totalSize > 0 && (
                    <div className="mb-3">
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            totalSize > MAX_TOTAL_SIZE
                              ? "bg-red-500"
                              : totalSize > MAX_TOTAL_SIZE * 0.9
                              ? "bg-yellow-500"
                              : "bg-blue-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              (totalSize / MAX_TOTAL_SIZE) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedFiles.map((file, index) => {
                      const fileKey = `${file.name}-${index}`;
                      const status = uploadStatus[fileKey];

                      return (
                        <div
                          key={fileKey}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatFileSize(file.size)}
                            </p>

                            {/* Progress bar */}
                            {status && (
                              <div className="mt-2">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-gray-600 dark:text-gray-400">
                                    {status.message}
                                  </span>
                                  <span className="text-gray-600 dark:text-gray-400">
                                    {status.progress}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                  <div
                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                      status.status === "success"
                                        ? "bg-green-500"
                                        : status.status === "error"
                                        ? "bg-red-500"
                                        : "bg-blue-500"
                                    }`}
                                    style={{ width: `${status.progress}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 ml-3">
                            {status?.status === "success" && (
                              <IoCheckmark className="w-5 h-5 text-green-500" />
                            )}
                            {status?.status === "error" && (
                              <IoAlert className="w-5 h-5 text-red-500" />
                            )}
                            {!isUploading && !status && (
                              <button
                                onClick={() => handleRemoveFile(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <IoClose className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              {!isUploading && (
                <button
                  onClick={closeDialog}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={uploadFiles}
                disabled={selectedFiles.length === 0 || isUploading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <IoCloudUpload className="w-4 h-4" />
                    <span>
                      Upload{" "}
                      {selectedFiles.length > 0
                        ? `${selectedFiles.length} Files`
                        : ""}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Upload Progress Modal */}
      {showUploadProgress && (
        <div className="fixed bottom-6 right-20 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-sm w-80 z-40">
          {/* Progress Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <IoCloudUpload className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Uploading {selectedFiles.length} files
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedProductType
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsProgressMinimized(!isProgressMinimized)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title={isProgressMinimized ? "Expand" : "Minimize"}
              >
                {isProgressMinimized ? "⬆️" : "⬇️"}
              </button>
              {!isUploading && (
                <button
                  onClick={() => setShowUploadProgress(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Close"
                >
                  <IoClose className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Progress Content */}
          {!isProgressMinimized && (
            <div className="p-4 max-h-60 overflow-y-auto">
              <div className="space-y-3">
                {selectedFiles.map((file, index) => {
                  const fileKey = `${file.name}-${index}`;
                  const status = uploadStatus[fileKey];

                  return (
                    <div key={fileKey} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {status?.status === "success" && (
                          <IoCheckmark className="w-4 h-4 text-green-500" />
                        )}
                        {status?.status === "error" && (
                          <IoAlert className="w-4 h-4 text-red-500" />
                        )}
                        {status?.status === "uploading" && (
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        {status && (
                          <div className="mt-1">
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  status.status === "success"
                                    ? "bg-green-500"
                                    : status.status === "error"
                                    ? "bg-red-500"
                                    : "bg-blue-500"
                                }`}
                                style={{ width: `${status.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Overall Progress Summary */}
          {!isProgressMinimized && (
            <div className="px-4 pb-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {
                  Object.values(uploadStatus).filter(
                    (s) => s.status === "success"
                  ).length
                }{" "}
                of {selectedFiles.length} completed
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
