import type { FAQItem } from "@/data/types";

export function FAQ({
  items,
  title = "A few things you might wonder.",
}: {
  items: FAQItem[];
  title?: string;
}) {
  return (
    <section className="container section faq">
      <p className="eyebrow">GOOD TO KNOW</p>
      <h2>{title}</h2>
      <div className="faq-list">
        {items.map((item) => (
          <details key={item.question}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
