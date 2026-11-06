import React, { useState, useEffect } from 'react';
import { Globe, UploadCloud, Menu, X, Sun, Moon, Compass, Bot, BookOpen } from 'lucide-react';

interface NavbarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenUpload: () => void;
  onSwitchToConsole?: () => void;
  onOpenAssistant?: () => void;
  onOpenDatasets?: () => void;
  onSelectSample?: (sample: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  onOpenUpload,
  onSwitchToConsole,
  onOpenAssistant,
  onOpenDatasets,
  onSelectSample,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Learn 101', href: '#learn' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Interactive Sonar', href: '#technology' },
    { name: 'Ocean Map', href: '#map' },
    { name: 'Impact', href: '#impact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 animate-entrance-nav ${
        scrolled
          ? theme === 'dark'
            ? 'bg-black/90 backdrop-blur-md border-b border-white/10 py-3'
            : 'bg-white/95 backdrop-blur-md border-b border-slate-200 py-3 shadow-sm'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="w-full max-w-[1720px] 2xl:max-w-[1880px] mx-auto px-6 sm:px-10 lg:px-14 flex items-center justify-between">
        
        {/* Left: Brand Logo & Title */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-white/20 dark:border-white/20 light:border-slate-300 group-hover:border-[#00ff88] transition-colors" />
            <div className="w-5 h-5 rounded-full border border-[#00ff88] animate-ping opacity-30" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#00ff88] shadow-[0_0_12px_#00ff88]" />
            <svg
              className="absolute inset-0 w-9 h-9 text-white/40 dark:text-white/40 light:text-slate-400 group-hover:text-white transition-colors"
              viewBox="0 0 32 32"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            >
              <path d="M4 16 C8 12, 12 20, 16 16 C20 12, 24 20, 28 16" />
            </svg>
          </div>
          <div>
            <span className="font-display font-extrabold tracking-tight text-lg sm:text-xl block leading-none text-white dark:text-white light:text-slate-950">
              SEA<span className="text-[#00ff88]">TRACE</span>
            </span>
            <span className="text-[9px] font-mono text-neutral-400 dark:text-neutral-400 light:text-slate-500 tracking-wider uppercase block mt-0.5">
              AUTONOMOUS ACOUSTIC AI
            </span>
          </div>
        </a>

        {/* Center: Clean, Focused Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-xs uppercase tracking-wider font-mono text-neutral-400 dark:text-neutral-400 light:text-slate-600">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="hover:text-white dark:hover:text-white light:hover:text-slate-950 transition-colors duration-200"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right Side: Key Actions (Clean & Uncrowded) */}
        <div className="hidden sm:flex items-center gap-3">
          {/* AI Assistant Pill */}
          {onOpenAssistant && (
            <button
              onClick={onOpenAssistant}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/40 hover:bg-[#00ff88] hover:text-black text-[#00ff88] dark:text-[#00ff88] light:text-emerald-700 light:hover:text-white font-mono text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-ping" />
              <Bot className="w-3.5 h-3.5" />
              <span>AI Assistant</span>
            </button>
          )}

          {/* Upload Sonar Button */}
          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white hover:bg-[#00ff88] text-black dark:bg-white dark:text-black dark:hover:bg-[#00ff88] light:bg-slate-900 light:text-white light:hover:bg-emerald-600 font-bold text-xs uppercase tracking-wider transition-all duration-200 hover:scale-105 cursor-pointer shadow-sm"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload .XTF</span>
          </button>

          {/* Tactical Console Shortcut */}
          {onSwitchToConsole && (
            <button
              onClick={onSwitchToConsole}
              className="p-2 rounded-full border border-white/15 hover:border-[#00ff88]/50 text-neutral-400 hover:text-white dark:border-white/15 dark:text-neutral-400 dark:hover:text-white light:border-slate-300 light:text-slate-600 light:hover:text-slate-950 transition-colors cursor-pointer"
              title="Open Tactical Hydrographic Workbench"
            >
              <Compass className="w-4 h-4 text-[#00e5ff] dark:text-[#00e5ff] light:text-sky-600" />
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-full border border-white/10 hover:border-white/30 text-neutral-400 hover:text-white dark:border-white/10 dark:hover:border-white/30 dark:text-neutral-400 dark:hover:text-white light:border-slate-300 light:hover:border-slate-500 light:text-slate-700 light:hover:text-slate-950 transition-colors cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-full border border-white/10 text-neutral-400 hover:text-white"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-300 hover:text-white"
            aria-label="Open Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-black/95 dark:bg-black/95 light:bg-white/95 border-b border-white/10 dark:border-white/10 light:border-slate-200 px-6 py-6 space-y-4 shadow-lg">
          <nav className="flex flex-col gap-4 text-sm uppercase tracking-wider text-neutral-300 dark:text-neutral-300 light:text-slate-700 font-mono">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#00ff88] transition-colors py-1"
              >
                {link.name}
              </a>
            ))}
            {onOpenAssistant && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAssistant();
                }}
                className="text-left text-[#00ff88] dark:text-[#00ff88] light:text-emerald-700 flex items-center gap-2 py-1 tracking-wider text-sm cursor-pointer"
              >
                <Bot className="w-4 h-4" />
                AI ASSISTANT & ASSESSMENT
              </button>
            )}
            {onSwitchToConsole && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSwitchToConsole();
                }}
                className="text-left text-[#00e5ff] dark:text-[#00e5ff] light:text-sky-700 flex items-center gap-2 py-1 tracking-wider text-sm cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                TACTICAL CONSOLE
              </button>
            )}
          </nav>

          <div className="pt-4 border-t border-white/10 dark:border-white/10 light:border-slate-200 flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenUpload();
              }}
              className="w-full py-2.5 rounded-full bg-white dark:bg-white dark:text-black light:bg-slate-900 light:text-white text-black font-bold text-xs uppercase tracking-wider text-center cursor-pointer shadow-sm"
            >
              Upload Sonar (.XTF)
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
export default Navbar;
