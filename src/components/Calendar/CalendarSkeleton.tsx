/**
 * Skeleton loading component for Calendar view
 * Displays a placeholder while calendar data is loading
 */

export default function CalendarSkeleton() {
  const skeletonUnits = Array.from({ length: 10 }, (_, i) => i);
  const skeletonDays = Array.from({ length: 14 }, (_, i) => i);

  return (
    <div className="w-screen h-[96vh] bg-[#FAFAFA] overflow-hidden flex flex-col">
      {/* Header Section */}
      <div className="flex bg-white border-b border-[#E0E0E0] h-[10vh] shrink-0">
        <div className="w-[200px] p-[1vh_1vw] flex items-center border-r border-[#E0E0E0] shrink-0">
          <div className="h-[1.4vh] w-[60%] bg-gray-200 rounded animate-pulse" />
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="flex min-w-max h-full">
            {/* Month headers */}
            <div className="flex flex-col h-full w-[400px]">
              <div className="p-[1vh_1vw] border-r border-[#E0E0E0] shrink-0">
                <div className="h-[1.2vh] w-[70%] bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="flex border-t border-[#E0E0E0] flex-1">
                {skeletonDays.slice(0, 7).map((idx) => (
                  <div
                    key={idx}
                    className="w-[clamp(50px,5vw,70px)] p-[0.5vh_0.3vw] flex flex-col items-center gap-[0.2vh] border-r border-[#E0E0E0] bg-white"
                  >
                    <div className="h-[0.9vh] w-[60%] bg-gray-200 rounded animate-pulse" />
                    <div className="h-[1.4vh] w-[40%] bg-gray-200 rounded animate-pulse mt-[0.5vh]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Body */}
      <div className="flex-1 flex overflow-hidden h-[86vh]">
        {/* Units Sidebar */}
        <div className="w-[200px] bg-white border-r border-[#E0E0E0] overflow-hidden shrink-0">
          {skeletonUnits.map((idx) => (
            <div key={idx} className="h-[4vh] flex items-center gap-[0.8vw] px-[1vw] border-b border-[#E0E0E0]">
              <div className="w-[3vh] h-[3vh] rounded bg-gray-200 animate-pulse shrink-0" />
              <div className="flex-1 h-[1vh] bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-hidden">
          <div className="min-w-max h-full">
            {skeletonUnits.map((idx) => (
              <div key={idx} className="h-[4vh] relative border-b border-[#E0E0E0]">
                {/* Grid Background */}
                <div className="flex h-full absolute inset-0">
                  {skeletonDays.map((dayIdx) => (
                    <div
                      key={dayIdx}
                      className="w-[clamp(50px,5vw,70px)] border-r border-[#E0E0E0] bg-white"
                    />
                  ))}
                </div>

                {/* Skeleton Reservations */}
                {idx % 3 === 0 && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div
                      className="absolute top-[0.6vh] h-[2.8vh] rounded bg-gray-200 animate-pulse"
                      style={{
                        left: `${(idx % 5) * 70}px`,
                        width: `${(3 + (idx % 4)) * 70}px`,
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
