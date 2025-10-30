import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function Navigation() {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-[100] h-[4vh] shrink-0 bg-gradient-to-br from-[#667eea] to-[#764ba2] shadow-md">
      <div className="mx-auto flex h-full max-w-full items-center justify-between px-[2vw]">
        <div className="flex items-center">
          <h1 className="m-0 text-[clamp(14px,1.5vh,18px)] font-bold tracking-tight text-white">
            Stays Observator
          </h1>
        </div>
        <div className="flex gap-[0.5vw]">
          <Link
            to="/"
            className={cn(
              "rounded-md bg-white/10 px-[1.5vw] py-[0.5vh] text-[clamp(11px,1.2vh,14px)] font-semibold text-white backdrop-blur-[10px] transition-all hover:-translate-y-px hover:bg-white/20",
              location.pathname === '/' && "bg-white/25 shadow-md"
            )}
          >
            Dashboard
          </Link>
          <Link
            to="/calendar"
            className={cn(
              "rounded-md bg-white/10 px-[1.5vw] py-[0.5vh] text-[clamp(11px,1.2vh,14px)] font-semibold text-white backdrop-blur-[10px] transition-all hover:-translate-y-px hover:bg-white/20",
              location.pathname === '/calendar' && "bg-white/25 shadow-md"
            )}
          >
            Calendário
          </Link>
        </div>
      </div>
    </nav>
  );
}
