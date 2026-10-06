import Link from "next/link";
import { Brand } from "@/components/ui/brand";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div>
          <Brand />
          <p>A little care. A greener everyday.</p>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/services">Our services</Link>
          <Link href="/areas">Areas</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/about">About</Link>
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/contact">Get in touch</Link>
        </nav>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} LawnFlow</span>
        <span>Development preview · Not yet accepting online bookings</span>
      </div>
    </footer>
  );
}
