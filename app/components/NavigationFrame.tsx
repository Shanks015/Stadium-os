'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function NavigationFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const sidebarLinks = [
    { name: 'Dashboard', href: '/', icon: 'dashboard' },
    { name: 'Gate Control', href: '/gate-control', icon: 'door_front' },
    { name: 'Crowd AI', href: '/crowd-ai', icon: 'psychology' },
    { name: 'Emergency', href: '/emergency', icon: 'emergency_home', iconClass: 'text-[#FF4911]' },
    { name: 'System Logs', href: '/system-logs', icon: 'terminal' },
  ];

  const topLinks = [
    { name: 'Operations', href: '/' },
    { name: 'Sectors', href: '/sectors' },
    { name: 'Security', href: '/security' },
    { name: 'Analytics', href: '/analytics' },
  ];

  return (
    <div className="flex pt-16 min-h-screen">
      {/* Top Navigation */}
      <header className="w-full h-16 border-b-4 border-black bg-[#F4F4F0] flex justify-between items-center px-8 fixed top-0 left-0 z-50 shadow-[0_4px_0_0_#000]">
        <div className="flex items-center gap-8 h-full">
          <span className="font-bold tracking-widest text-black uppercase">STADIUM OS v1.0</span>
          <nav aria-label="Main navigation" className="hidden md:flex h-full items-end gap-6 pb-1">
            {topLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`uppercase font-bold text-sm px-2 py-1 transition-colors ${
                    isActive
                      ? 'text-black border-b-4 border-black pb-1'
                      : 'text-gray-500 hover:bg-gray-255 hover:bg-opacity-10 hover:bg-black'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button aria-label="View notifications" className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 border-2 border-black">
            <span className="material-symbols-outlined text-black" aria-hidden="true">notifications</span>
          </button>
          <button aria-label="Open settings" className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 border-2 border-black">
            <span className="material-symbols-outlined text-black" aria-hidden="true">settings</span>
          </button>
          <div aria-label="Administrator profile" className="w-8 h-8 bg-black border-2 border-black"></div>
        </div>
      </header>

      {/* Side Navigation */}
      <aside className="hidden md:flex flex-col h-screen border-r-4 border-black pt-16 w-64 fixed left-0 top-0 bg-[#F4F4F0] z-40">
        <div className="p-6 border-b-4 border-black bg-[#E2FF32]">
          <h2 className="text-2xl font-black uppercase text-black">SECTOR ALPHA</h2>
          <div className="flex items-center gap-2 mt-2 font-bold text-xs uppercase text-black">
            <span className="w-3 h-3 bg-green-500 rounded-none pulse-dot border border-black"></span>
            <span>Live Stream Enabled</span>
          </div>
        </div>
        <nav aria-label="Sidebar navigation" className="flex-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-4 px-6 py-4 border-b-2 border-black transition-colors uppercase font-bold text-sm group ${
                  isActive
                    ? 'bg-black text-white'
                    : 'text-black hover:bg-[#E2FF32] hover:text-black'
                }`}
              >
                <span className={`material-symbols-outlined ${link.iconClass || ''} ${isActive ? 'text-white' : 'group-hover:text-black'}`}>
                  {link.icon}
                </span>
                {link.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t-4 border-black bg-white">
          <Link
            href="#"
            className="flex items-center justify-center gap-4 px-6 py-4 text-black hover:bg-black hover:text-white transition-colors border-4 border-black font-bold uppercase text-sm"
          >
            <span className="material-symbols-outlined">logout</span> Logout
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main id="main-content" role="main" className="w-full md:ml-64 p-8 overflow-y-auto bg-[#F4F4F0] min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  );
}
