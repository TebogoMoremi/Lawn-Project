// Bounded process-local guard. Replace with a shared store at production ingress.
export class SubmissionLimiter {
  private count = 0;
  private resetAt = 0;
  private active = 0;
  enter(now = Date.now()) {
    if (now >= this.resetAt) {
      this.count = 0;
      this.resetAt = now + 60000;
    }
    if (this.count >= 30 || this.active >= 3) return null;
    this.count++;
    this.active++;
    let released = false;
    return () => {
      if (!released) {
        this.active--;
        released = true;
      }
    };
  }
}
const globalLimiter = globalThis as unknown as {
  quoteSubmissionLimiter?: SubmissionLimiter;
};
export const submissionLimiter = (globalLimiter.quoteSubmissionLimiter ??=
  new SubmissionLimiter());
