"use client";

import { useEffect, useState } from "react";
import {
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoFolderOutline,
} from "react-icons/io5";

interface Project {
  id: string;
  name: string;
}

export default function Sidebar() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    fetch("/api/projects")
      .then(async (res) => {
        try {
          const data = await res.json();
          setProjects(Array.isArray(data.projects) ? data.projects : []);
        } catch {
          setProjects([]);
        }
      })
      .catch(() => setProjects([]));
  }, []);

  return (
    <aside
      className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col transition-all duration-200 z-20 fixed top-0 left-0 pt-16 md:pt-0 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      {/* Collapse Button (visible on small screens) */}
      <button
        className="md:hidden absolute top-4 right-[-18px] z-30 bg-blue-600 text-white rounded-full p-1 shadow-md focus:outline-none"
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <IoChevronForwardOutline className="h-5 w-5" />
        ) : (
          <IoChevronBackOutline className="h-5 w-5" />
        )}
      </button>
      <nav className="flex-1 overflow-y-auto mt-8 md:mt-0 p-4">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Projects
          </h2>
        </div>

        {projects.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-8">
            <IoFolderOutline className="mx-auto h-8 w-8 mb-2" />
            No projects yet
          </div>
        ) : (
          <ul className="space-y-1">
            {projects.map((project) => (
              <li key={project.id}>
                <button
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-150 font-medium text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900 focus:outline-none focus:bg-blue-200 dark:focus:bg-blue-800 ${
                    activeId === project.id
                      ? "bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200"
                      : ""
                  }`}
                  onClick={() => setActiveId(project.id)}
                >
                  <div className="flex items-center">
                    <IoFolderOutline className="h-4 w-4 mr-2 text-gray-400" />
                    {project.name}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </aside>
  );
}
