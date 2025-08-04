"use client";

import {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import Image from "next/image";
import ImageModal from "./ImageModal";
import {
  IoBusinessOutline,
  IoCalendarOutline,
  IoTimeOutline,
  IoFolderOutline,
  IoDocumentTextOutline,
  IoChevronForward,
  IoImageOutline,
  IoCardOutline,
  IoShirtOutline,
  IoStorefrontOutline,
} from "react-icons/io5";

interface FolderItem {
  id: string;
  name: string;
  type: "product" | "year" | "month" | "day" | "file" | "image";
  size?: string;
  image_url?: string;
  uploaded_at?: string;
  product_type?: string;
  count?: number;
}

interface Breadcrumb {
  name: string;
  path: string;
}

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

interface FolderViewProps {
  onNavigateToPath?: (path: string) => void;
  onImageSelect?: (image: SearchResult) => void;
}

interface FolderViewRef {
  navigateToPath: (path: string) => void;
}

const FolderView = forwardRef<FolderViewRef, FolderViewProps>(
  ({ onNavigateToPath, onImageSelect }, ref) => {
    const [items, setItems] = useState<FolderItem[]>([]);
    const [currentPath, setCurrentPath] = useState("");
    const [loading, setLoading] = useState(true);
    const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);

    // Modal state for image preview
    const [selectedImage, setSelectedImage] = useState<FolderItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchItems = async (path: string) => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/products?path=${encodeURIComponent(path)}`
        );
        const data = await response.json();
        setItems(data.items || []);

        // Update breadcrumbs
        const newBreadcrumbs: Breadcrumb[] = [{ name: "Home", path: "" }];

        if (path) {
          const parts = path.split("/").filter(Boolean);
          let partPath = "";

          parts.forEach((part, index) => {
            partPath += (index > 0 ? "/" : "") + part;

            // Convert path segments to readable names
            let name = part;
            if (part === "metal_cards") name = "Metal Cards";
            else if (part === "nfc_cards") name = "NFC Cards";
            else if (part === "tshirt") name = "T-Shirt";
            else if (part === "standees") name = "Standees";
            else if (part.match(/^\d{4}$/)) name = `Year ${part}`;
            else if (part.match(/^\d{1,2}$/)) {
              const months = [
                "",
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ];
              name = months[parseInt(part)] || part;
            }

            newBreadcrumbs.push({ name, path: partPath });
          });
        }

        setBreadcrumbs(newBreadcrumbs);
      } catch (error) {
        console.error("Error fetching folders:", error);
        setItems([]);
      }
      setLoading(false);
    };

    useEffect(() => {
      fetchItems("");
    }, []);

    // Add method to programmatically navigate to a path
    const navigateToPath = useCallback(
      (path: string) => {
        setCurrentPath(path);
        fetchItems(path);
        onNavigateToPath?.(path);
      },
      [onNavigateToPath]
    );

    // Expose navigation method via ref
    useImperativeHandle(
      ref,
      () => ({
        navigateToPath,
      }),
      [navigateToPath]
    );

    // Expose navigation method globally for search functionality
    useEffect(() => {
      if (typeof window !== "undefined") {
        window.navigateToFolder = navigateToPath;
        return () => {
          delete window.navigateToFolder;
        };
      }
    }, [navigateToPath]);

    const handleClick = (item: FolderItem) => {
      if (item.type === "image") {
        // Check if there's an external handler for image selection
        if (onImageSelect) {
          const searchResult: SearchResult = {
            id: item.id,
            name: item.name,
            type: "image",
            image_url: item.image_url || "",
            uploaded_at: item.uploaded_at || "",
            product_type: item.product_type || "",
            path: currentPath,
            breadcrumbs: breadcrumbs,
          };
          onImageSelect(searchResult);
        } else {
          // Open image modal locally
          setSelectedImage(item);
          setIsModalOpen(true);
        }
      } else {
        // Navigate to folder - use item.id directly as it contains the full path
        navigateToPath(item.id);
      }
    };

    const handleBreadcrumbClick = (path: string) => {
      navigateToPath(path);
    };

    const closeModal = () => {
      setIsModalOpen(false);
      setSelectedImage(null);
    };

    const getIcon = (item: FolderItem) => {
      switch (item.type) {
        case "product":
          // Different icons for different product types
          if (item.name === "Metal Cards") {
            return <IoCardOutline className="w-6 h-6 text-slate-600" />;
          } else if (item.name === "NFC Cards") {
            return <IoBusinessOutline className="w-6 h-6 text-blue-600" />;
          } else if (item.name === "Standees") {
            return <IoStorefrontOutline className="w-6 h-6 text-purple-600" />;
          } else if (item.name === "T-Shirt") {
            return <IoShirtOutline className="w-6 h-6 text-green-600" />;
          }
          return <IoBusinessOutline className="w-6 h-6 text-blue-600" />;
        case "year":
          return <IoCalendarOutline className="w-6 h-6 text-emerald-600" />;
        case "month":
          return <IoTimeOutline className="w-6 h-6 text-violet-600" />;
        case "day":
          return <IoFolderOutline className="w-6 h-6 text-amber-600" />;
        case "file":
          return <IoDocumentTextOutline className="w-6 h-6 text-gray-600" />;
        case "image":
          return <IoImageOutline className="w-6 h-6 text-rose-600" />;
        default:
          return <IoFolderOutline className="w-6 h-6 text-gray-600" />;
      }
    };

    const formatSize = (size?: string) => {
      if (!size) return "";
      const bytes = parseInt(size);
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatDate = (dateString?: string) => {
      if (!dateString) return "";
      return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-blue-600"></div>
          <p className="mt-4 text-sm text-gray-500 font-medium">Loading...</p>
        </div>
      );
    }

    return (
      <div className="p-6 w-full">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-1 mb-6 text-sm w-full">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.path || "home"} className="flex items-center">
              {index > 0 && (
                <IoChevronForward className="w-4 h-4 mx-2 text-gray-400" />
              )}
              <button
                onClick={() => handleBreadcrumbClick(crumb.path)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                  index === breadcrumbs.length - 1
                    ? "text-gray-900 bg-gray-100"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {crumb.name}
              </button>
            </div>
          ))}
        </nav>

        {/* Folder Insights */}
        {items.length > 0 && (
          <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <IoBusinessOutline className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-sm font-medium text-gray-700">
                    No of Products
                  </h2>
                  <p className="text-lg font-bold text-gray-900">
                    {items.length}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Type</p>
                <p className="text-sm font-medium text-gray-700">
                  {items.every((item) => item.type === "image")
                    ? "Images"
                    : items.every((item) => item.type === "product")
                    ? "Products"
                    : items.every((item) => item.type === "year")
                    ? "Years"
                    : items.every((item) => item.type === "month")
                    ? "Months"
                    : items.every((item) => item.type === "day")
                    ? "Days"
                    : "Items"}
                </p>
              </div>
            </div>

            {/* Product Distribution (only show at root level) */}
            {currentPath === "" && items.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-50 rounded-lg p-3 text-center hover:bg-gray-100 transition-colors"
                    >
                      <div className="mb-2 flex justify-center">
                        <div className="w-6 h-6">{getIcon(item)}</div>
                      </div>
                      <p className="text-xs font-medium text-gray-800 truncate mb-1">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.count || 0}{" "}
                        {(item.count || 0) === 1 ? "item" : "items"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Items Grid */}
        {items.length === 0 ? (
          <div className="text-center py-16 w-full">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
              <IoFolderOutline className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No items found
            </h3>
            <p className="text-gray-500">This folder appears to be empty</p>
          </div>
        ) : (
          <div className="w-full">
            <div
              className={`grid gap-6 w-full ${
                items.length <= 3
                  ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                  : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
              }`}
            >
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleClick(item)}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer group w-full"
                >
                  <div className="flex flex-col items-center w-full">
                    {/* Icon or Image Preview */}
                    <div className="mb-4 w-full flex justify-center">
                      {item.type === "image" && item.image_url ? (
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-50 ring-1 ring-gray-200">
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                            sizes="80px"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 flex items-center justify-center bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors border border-gray-200">
                          {getIcon(item)}
                        </div>
                      )}
                    </div>

                    {/* Item Info */}
                    <div className="text-center w-full">
                      <h3
                        className="font-semibold text-gray-800 text-sm mb-1 truncate w-full group-hover:text-gray-900 transition-colors"
                        title={item.name}
                      >
                        {item.name}
                      </h3>

                      {item.type === "image" && (
                        <div className="text-xs text-gray-500 space-y-1">
                          {item.size && (
                            <p className="font-medium">
                              {formatSize(item.size)}
                            </p>
                          )}
                          {item.uploaded_at && (
                            <p>{formatDate(item.uploaded_at)}</p>
                          )}
                        </div>
                      )}

                      {item.count !== undefined && (
                        <p className="text-xs text-gray-500 font-medium">
                          {item.count} {item.count === 1 ? "item" : "items"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Modal - only show if not using external handler */}
        {selectedImage && !onImageSelect && (
          <ImageModal
            isOpen={isModalOpen}
            onClose={closeModal}
            imageUrl={selectedImage.image_url || ""}
            imageName={selectedImage.name}
            uploadedAt={selectedImage.uploaded_at}
            productType={selectedImage.product_type}
          />
        )}
      </div>
    );
  }
);

FolderView.displayName = "FolderView";

export default FolderView;
