import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { gsap } from 'gsap';
import type { MenuData } from '../../types';

interface NavMenuProps {
  /** Controls whether the full-screen overlay is visible. */
  isOpen: boolean;
  /** Called when the user closes the menu (close button or nav link click). */
  onClose: () => void;
  /** Menu content data (nav links, social links, email). */
  menuData: MenuData;
  /** Called when a nav link is clicked. Receives the raw href from menuData. */
  onNavClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}

/**
 * NavMenu
 *
 * Full-screen overlay navigation with GSAP clip-path reveal animation.
 * Shared between the Hero section (home page) and the Projects page.
 *
 * The parent is responsible for managing `isOpen` state and implementing
 * `onNavClick` routing logic (which differs between pages).
 */
const NavMenu: React.FC<NavMenuProps> = ({ isOpen, onClose, menuData, onNavClick }) => {
  const menuRef    = useRef<HTMLDivElement>(null);
  const ctxRef     = useRef<gsap.Context | null>(null);
  const isInitial  = useRef(true);

  // Set up a persistent GSAP context for the menu animations
  useEffect(() => {
    ctxRef.current = gsap.context(() => {});
    return () => {
      ctxRef.current?.revert();
    };
  }, []);

  // Animate the overlay whenever isOpen changes (skip the very first render)
  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false;
      return;
    }
    if (!ctxRef.current) return;

    ctxRef.current.add(() => {
      gsap.killTweensOf([menuRef.current, '.nav-menu-close-btn', '.nav-menu-link', '.nav-menu-footer-item']);

      if (isOpen) {
        document.body.style.overflow = 'hidden';

        gsap.timeline()
          .fromTo(menuRef.current,
            { clipPath: 'circle(0% at 95% 5%)', autoAlpha: 0 },
            { clipPath: 'circle(150% at 95% 5%)', autoAlpha: 1, duration: 0.8, ease: 'power3.inOut' },
          )
          .fromTo('.nav-menu-close-btn',
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.7)' },
            '-=0.3',
          )
          .fromTo('.nav-menu-link',
            { y: 80, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7, ease: 'power4.out', stagger: 0.12 },
            '-=0.5',
          )
          .fromTo('.nav-menu-footer-item',
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out', stagger: 0.1 },
            '-=0.4',
          );
      } else {
        document.body.style.overflow = '';

        gsap.timeline()
          .to('.nav-menu-link',
            { y: 30, opacity: 0, duration: 0.3, ease: 'power2.in', stagger: 0.05 },
          )
          .to('.nav-menu-close-btn',
            { opacity: 0, scale: 0.9, duration: 0.2, ease: 'power2.in' },
            0,
          )
          .to('.nav-menu-footer-item',
            { opacity: 0, y: 10, duration: 0.2, ease: 'power2.in', stagger: 0.03 },
            0,
          )
          .to(menuRef.current,
            { clipPath: 'circle(0% at 95% 5%)', autoAlpha: 0, duration: 0.6, ease: 'power3.inOut' },
            0.15,
          );
      }
    });
  }, [isOpen]);

  return (
    <div
      ref={menuRef}
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col justify-between p-8 md:p-16 border-l border-zinc-900"
      style={{ opacity: 0, visibility: 'hidden', clipPath: 'circle(0% at 95% 5%)' }}
    >
      {/* Close button */}
      <div className="flex justify-end items-center w-full relative z-10">
        <button
          onClick={onClose}
          className="nav-menu-close-btn text-zinc-400 hover:text-white transition-colors duration-300 focus:outline-none p-2 opacity-0"
          aria-label="Close menu"
        >
          <X className="h-8 w-8 transition-transform duration-300 hover:rotate-90" />
        </button>
      </div>

      {/* Nav links */}
      <div className="flex flex-col items-end justify-center my-auto w-full relative z-10 px-8 sm:px-16 md:px-24 lg:px-32">
        <nav className="group/nav flex flex-col gap-8 md:gap-14 w-full items-end">
          {menuData.navLinks.map((item, index) => (
            <div
              key={item.label + index}
              className="nav-menu-link-wrapper border-b border-zinc-900/50 pb-2 overflow-hidden w-full text-right"
            >
              <a
                href={item.href}
                onClick={(e) => onNavClick(e, item.href)}
                className="nav-menu-link flex items-baseline justify-end gap-6 md:gap-10 font-garamond text-4xl sm:text-6xl md:text-[5.5rem] lg:text-[7.5rem] xl:text-[10rem] font-extralight tracking-tighter text-zinc-100 hover:!text-white transition-all duration-300 opacity-0 w-full group-hover/nav:opacity-30 hover:!opacity-100 group-hover/nav:text-zinc-600 pr-2 md:pr-4 pb-4 sm:pb-6"
              >
                <span>{item.label}</span>
              </a>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer row */}
      <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-4 text-xs font-mono text-zinc-500 border-t border-zinc-900 pt-6 relative z-10">
        <div className="nav-menu-footer-item opacity-0">
          <a href={`mailto:${menuData.email}`} className="hover:text-white transition-colors">
            {menuData.email}
          </a>
        </div>
        <div className="nav-menu-footer-item flex gap-4 opacity-0">
          {menuData.socialLinks.map((link, idx) => (
            <a
              key={link.platform + idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              {link.platform}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NavMenu;
