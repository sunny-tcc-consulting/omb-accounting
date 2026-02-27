"use client";

import { VERSION_INFO } from "@/lib/version";

export function VersionDisplay() {
  // Get the short commit hash (last 7 chars)
  const shortHash = VERSION_INFO.commitHash.slice(-7);

  return (
    <div className="fixed bottom-4 right-4 z-50" suppressHydrationWarning>
      <div
        className="bg-gray-900/90 text-gray-300 px-3 py-2 rounded-lg text-xs font-mono backdrop-blur-sm border border-gray-700/50"
        suppressHydrationWarning
      >
        <div className="flex items-center gap-2" suppressHydrationWarning>
          <span className="text-gray-500" suppressHydrationWarning>
            v{VERSION_INFO.version}
          </span>
          <span className="text-gray-600" suppressHydrationWarning>
            |
          </span>
          <span
            className="text-green-400 cursor-pointer hover:text-green-300"
            title={`Full commit: ${VERSION_INFO.commitHash}\nBuild: ${VERSION_INFO.buildDate}`}
            suppressHydrationWarning
          >
            #{shortHash}
          </span>
          <span className="text-gray-600" suppressHydrationWarning>
            |
          </span>
          <span
            className={
              VERSION_INFO.environment === "production"
                ? "text-red-400"
                : "text-yellow-400"
            }
            suppressHydrationWarning
          >
            {VERSION_INFO.environment === "production" ? "PROD" : "DEV"}
          </span>
        </div>
      </div>
    </div>
  );
}
