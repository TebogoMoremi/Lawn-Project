import Link from "next/link";

export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="LawnFlow home">
      <svg
        width="33"
        height="33"
        viewBox="0 0 36 36"
        fill="none"
        aria-hidden="true"
      >
        <rect width="36" height="36" rx="11" fill="currentColor" />
        <path
          d="M10 24C10 13 17 10 27 9c0 10-4 17-14 17m0-3 10-10"
          stroke="#f3f7e7"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span>
        Lawn<span className="brand-accent">Flow</span>
      </span>
    </Link>
  );
}
