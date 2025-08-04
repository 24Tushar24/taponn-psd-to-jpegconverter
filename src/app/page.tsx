import FolderView from "@/components/FolderView";
import FloatingUploadButton from "@/components/FloatingUploadButton";

export default function Home() {
  return (
    <div className="h-full">
      <FolderView />
      <FloatingUploadButton />
    </div>
  );
}
