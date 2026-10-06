import { ButtonLink } from "@/components/ui/button-link";
export default function NotFound() {
  return (
    <main id="main-content" className="container notice-page">
      <p className="eyebrow">404 · A LITTLE OFF THE GARDEN PATH</p>
      <h1>Let’s head back.</h1>
      <p>We couldn’t find that page.</p>
      <ButtonLink href="/">Back to home</ButtonLink>
    </main>
  );
}
