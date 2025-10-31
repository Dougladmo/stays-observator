/**
 * Skeleton loading screen for Dashboard
 * Shows placeholder structure while data is being fetched
 */

import { Card } from '../ui/card';

export default function DashboardSkeleton() {
  return (
    <div className="h-[96vh] w-screen overflow-hidden bg-[#ecf0f1] p-[1vh_1vw] flex flex-col">
      {/* Week cards skeleton */}
      <div className="grid grid-cols-7 gap-[0.5vw] mb-[1vh] h-[93vh] overflow-hidden shrink-0">
        {[...Array(7)].map((_, i) => (
          <Card key={i} className="flex flex-col h-full overflow-hidden animate-pulse">
            {/* Header skeleton */}
            <div className="bg-gray-300 p-[1vh_0.5vw] text-center shrink-0">
              <div className="h-[1.8vh] bg-gray-400 rounded mb-[0.3vh] mx-auto w-16"></div>
              <div className="h-[1vh] bg-gray-400 rounded mb-[0.5vh] mx-auto w-12"></div>
              <div className="grid grid-cols-3 gap-[0.5vw] justify-center mt-[0.5vh]">
                <div className="h-[2vh] bg-gray-400 rounded"></div>
                <div className="h-[2vh] bg-gray-400 rounded"></div>
                <div className="h-[2vh] bg-gray-400 rounded"></div>
              </div>
            </div>
            {/* Guest cards skeleton */}
            <div className="p-[0.8vh_0.5vw] columns-2 gap-[0.5vw] flex-1">
              {[...Array(6)].map((_, j) => (
                <div key={j} className="mb-[0.5vw] break-inside-avoid">
                  <div className="h-[4vh] bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

    </div>
  );
}
