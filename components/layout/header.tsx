"use client";

import { useState } from "react";
import Link from "next/link";
import { Brand } from "@/components/ui/brand";
import { ButtonLink } from "@/components/ui/button-link";

const links = [
  ["Home", "/"],
  ["Services", "/#services"],
  ["Areas", "/#areas"],
  ["Gallery", "/#gallery"],
  ["About", "/#about"],
  ["Contact", "/#contact"],
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Brand />
        <button
          className="menu-toggle"
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
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              document
                .querySelector<HTMLButtonElement>(".menu-toggle")
                ?.focus();
            }
          }}
        >
          <ul>
            {links.map(([label, href]) => (
              <li key={label}>
                <Link href={href} onClick={() => setOpen(false)}>
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
