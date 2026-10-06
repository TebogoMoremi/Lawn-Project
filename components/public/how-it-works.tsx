import { steps } from "@/features/home/content";

export function HowItWorks() {
  return (
    <section className="process-section" id="how-it-works">
      <div className="container section">
        <p className="eyebrow">FROM TO-DO TO TA-DA</p>
        <h2>A simpler way to a tidy garden.</h2>
        <p className="intro">
          Here’s how LawnFlow will work when bookings open.
        </p>
        <div className="steps">
          {steps.map((step, index) => (
            <article key={step.title}>
              <span className="step-number">0{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
