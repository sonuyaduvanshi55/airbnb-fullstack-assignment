"use client";

import { Globe2, Heart, House, Menu, Plane, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useCurrentUser } from "@/components/AppProviders";

export function Header() {
  const pathname = usePathname();
  const { user, setRole } = useCurrentUser();

  const navItems = [
    { href: "/", label: "Explore", icon: House },
    { href: "/trips", label: "My trips", icon: Plane },
    { href: "/favorites", label: "Wishlists", icon: Heart },
    { href: "/host", label: "Host", icon: UserRound }
  ];

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand" aria-label="Staybnb home">
          <span className="brand-mark">⌂</span>
          <span>staybnb</span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={active ? "nav-link active" : "nav-link"}>
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="header-actions">
          <button className="language-button" type="button" title="Language and currency">
            <Globe2 size={18} />
          </button>
          <div className="role-switch" aria-label="Demo role switcher">
            <button
              type="button"
              className={user.role === "guest" ? "selected" : ""}
              onClick={() => setRole("guest")}
            >
              Guest
            </button>
            <button
              type="button"
              className={user.role === "host" ? "selected" : ""}
              onClick={() => setRole("host")}
            >
              Host
            </button>
          </div>
          <div className="profile-pill" title={`Signed in as ${user.name}`}>
            <Menu size={18} />
            <img src={user.avatar} alt={user.name} />
          </div>
        </div>
      </div>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navItems.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={active ? "mobile-link active" : "mobile-link"}>
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
