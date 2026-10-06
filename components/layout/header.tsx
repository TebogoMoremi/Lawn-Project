"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Brand } from "@/components/ui/brand";
import { ButtonLink } from "@/components/ui/button-link";

const links = [
  ["Home", "/"],
  ["Services", "/services"],
  ["Areas", "/areas"],
  ["Gallery", "/gallery"],
  ["About", "/about"],
  ["Contact", "/contact"],
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const toggle = useRef<HTMLButtonElement>(null);
  return (
    <header
      className="site-header"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          toggle.current?.focus();
        }
      }}
    >
      <div className="container header-inner">
        <Brand />
        <button
          className="menu-toggle"
          ref={toggle}
          type="button"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? "Close" : "Menu"}
          <span aria-hidden="true">{open ? " ×" : " ☰"}</span>
        </button>
        <nav
          id="primary-nav"
          aria-label="Main navigation"
          className={open ? "navigation is-open" : "navigation"}
        >
          <ul>
            {links.map(([label, href]) => (
              <li key={label}>
                <Link
                  href={href}
                  aria-current={
                    pathname === href
                      ? "page"
                      : href !== "/" && pathname.startsWith(`${href}/`)
                        ? "location"
                        : undefined
                  }
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div onClick={() => setOpen(false)}>
            <ButtonLink href="/quote">
              Get Free Quote <span aria-hidden="true">↗</span>
            </ButtonLink>
          </div>
        </nav>
      </div>
    </header>
  );
}
