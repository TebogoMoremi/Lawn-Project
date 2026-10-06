"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
} from "react";
import { useRouter } from "next/navigation";
import {
  contactSchema,
  locationSchema,
  servicesSchema,
  propertySchema,
  notesSchema,
  quoteSchema,
  fieldErrors,
  propertyTypes,
  lawnSizes,
  lawnConditions,
  frequencies,
  privacyNotice,
  type QuoteDraft,
  type QuoteServiceOption,
} from "./validation";
import { photoSelectionError, type UploadLimits } from "./photo-rules";

const steps = [
  "Contact",
  "Location",
  "Services",
  "Property",
  "Photos",
  "Notes",
  "Review",
];
const emptyDraft: QuoteDraft = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  suburb: "",
  city: "",
  province: "",
  postalCode: "",
  serviceIds: [],
  propertyType: "RESIDENTIAL",
  lawnSizeCategory: "UNKNOWN",
  lawnCondition: "UNKNOWN",
  frequency: "UNKNOWN",
  notes: "",
  consent: false,
};
const schemas = [
  contactSchema,
  locationSchema,
  servicesSchema,
  propertySchema,
  null,
  notesSchema,
  quoteSchema,
];
const tokenKey = "lawnflow-quote-attempt";

function PhotoPreview({
  file,
  index,
  remove,
}: {
  file: File;
  index: number;
  remove: () => void;
}) {
  const image = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const url = URL.createObjectURL(file);
    if (image.current) image.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return (
    <li>
      <figure>
        {/* Local blob previews never use the image optimization server. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={image}
          alt={`Selected garden photo ${index + 1}`}
          width="160"
          height="120"
        />
        <figcaption>{file.name}</figcaption>
      </figure>
      <button
        type="button"
        className="button button-secondary"
        onClick={remove}
      >
        Remove photo {index + 1}
      </button>
    </li>
  );
}

function TextField({
  label,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <div className="quote-field">
      <label htmlFor={props.id}>{label}</label>
      <input
        {...props}
        aria-invalid={!!error}
        aria-describedby={error ? `${props.id}-error` : undefined}
      />
      {error && (
        <p id={`${props.id}-error`} className="quote-error">
          {error}
        </p>
      )}
    </div>
  );
}

export function QuoteForm({
  services,
  limits,
}: {
  services: QuoteServiceOption[];
  limits: UploadLimits;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<QuoteDraft>(emptyDraft);
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [conflict, setConflict] = useState(false);
  const busy = useRef(false);
  const token = useRef<string>("");
  const heading = useRef<HTMLHeadingElement>(null);
  const summary = useRef<HTMLDivElement>(null);
  const moved = useRef(false);
  useEffect(() => {
    if (moved.current) heading.current?.focus();
  }, [step]);
  useEffect(() => {
    if (Object.keys(errors).length) summary.current?.focus();
  }, [errors]);
  const set = <K extends keyof QuoteDraft>(key: K, value: QuoteDraft[K]) =>
    setDraft((old) => ({ ...old, [key]: value }));
  function go(next: number) {
    moved.current = true;
    setErrors({});
    setStep(next);
  }
  function validate() {
    if (step === 4) {
      const error = photoSelectionError(files, limits);
      if (error) {
        setErrors({ photos: error });
        return false;
      }
      return true;
    }
    const schema = schemas[step];
    if (!schema) return true;
    // Keep each strict step schema scoped to its own fields.
    const input = Object.fromEntries(
      Object.keys(schema.shape).map((key) => [
        key,
        draft[key as keyof QuoteDraft],
      ]),
    );
    const result = schema.safeParse(input);
    if (!result.success) {
      setErrors(fieldErrors(result.error));
      return false;
    }
    return true;
  }
  function field(
    key: keyof QuoteDraft,
    label: string,
    options: InputHTMLAttributes<HTMLInputElement> = {},
  ) {
    return (
      <TextField
        key={key}
        id={key}
        name={key}
        label={label}
        value={String(draft[key])}
        onChange={(event) => set(key, event.target.value as never)}
        error={errors[key]}
        required={key !== "addressLine2"}
        {...options}
      />
    );
  }
  function select(
    key: "propertyType" | "lawnSizeCategory" | "lawnCondition" | "frequency",
    label: string,
    options: Record<string, string>,
  ) {
    return (
      <div className="quote-field">
        <label htmlFor={key}>{label}</label>
        <select
          id={key}
          value={draft[key]}
          onChange={(event) =>
            set(key, event.target.value as QuoteDraft[typeof key])
          }
          aria-invalid={!!errors[key]}
          aria-describedby={errors[key] ? `${key}-error` : undefined}
        >
          {Object.entries(options).map(([value, name]) => (
            <option key={value} value={value}>
              {name}
            </option>
          ))}
        </select>
        {errors[key] && (
          <p id={`${key}-error`} className="quote-error">
            {errors[key]}
          </p>
        )}
      </div>
    );
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy.current || submitted || !validate()) return;
    if (step < 6) {
      go(step + 1);
      return;
    }
    const parsed = quoteSchema.safeParse(draft);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    busy.current = true;
    setPending(true);
    setErrors({});
    try {
      if (!token.current) {
        try {
          token.current = sessionStorage.getItem(tokenKey) ?? "";
        } catch {
          /* In-memory retry protection still applies. */
        }
        if (!/^[a-f0-9]{64}$/.test(token.current))
          token.current = Array.from(
            crypto.getRandomValues(new Uint8Array(32)),
            (byte) => byte.toString(16).padStart(2, "0"),
          ).join("");
        try {
          sessionStorage.setItem(tokenKey, token.current);
        } catch {
          /* Never persist personal form data. */
        }
      }
      const body = new FormData();
      body.set(
        "payload",
        JSON.stringify({ request: parsed.data, token: token.current }),
      );
      files.forEach((file) => body.append("photos", file));
      const response = await fetch("/api/quotes", { method: "POST", body });
      const result = (await response.json()) as {
        error?: string;
        location?: string;
      };
      if (!response.ok) {
        setConflict(response.status === 409);
        setErrors({
          form:
            result.error ||
            "Your request could not be submitted. Please retry.",
        });
        return;
      }
      if (result.location !== "/quote/success")
        throw new Error("Invalid receipt response");
      try {
        sessionStorage.removeItem(tokenKey);
      } catch {
        /* The receipt is stored in an HttpOnly cookie. */
      }
      setDraft(emptyDraft);
      setFiles([]);
      setSubmitted(true);
      router.replace("/quote/success");
      router.refresh();
    } catch {
      setErrors({
        form: "We couldn’t confirm your submission. Keep this form open and retry with the same details to avoid duplicate requests.",
      });
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  if (submitted)
    return (
      <div className="quote-panel" role="status">
        Your request was received.{" "}
        <a href="/quote/success">View your private confirmation</a>.
      </div>
    );
  return (
    <form
      className="quote-form"
      method="post"
      action="/api/quotes"
      encType="multipart/form-data"
      onSubmit={submit}
      noValidate
      aria-busy={pending}
    >
      <noscript>
        <p>
          This form needs JavaScript to validate and submit a request. Please
          enable it or use our contact options.
        </p>
      </noscript>
      <nav aria-label="Quote progress">
        <ol className="quote-progress">
          {steps.map((name, index) => (
            <li key={name} aria-current={index === step ? "step" : undefined}>
              <span>{index + 1}</span>
              {name}
              {index < step && <span className="sr-only"> completed</span>}
            </li>
          ))}
        </ol>
      </nav>
      <div className="quote-panel">
        <p className="eyebrow">
          STEP {step + 1} OF {steps.length}
        </p>
        <h2 ref={heading} tabIndex={-1}>
          {steps[step]}
        </h2>
        {!!Object.keys(errors).length && (
          <div
            className="quote-error-summary"
            role="alert"
            tabIndex={-1}
            ref={summary}
          >
            <strong>Please check the following:</strong>
            <ul>
              {Object.entries(errors).map(([key, message]) => (
                <li key={key}>
                  {key === "form" ? (
                    message
                  ) : (
                    <a
                      href={`#${key}`}
                      onClick={(event) => {
                        event.preventDefault();
                        document.getElementById(key)?.focus();
                      }}
                    >
                      {message}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        {conflict && (
          <div className="quote-panel">
            <p>
              An earlier request exists for this attempt. Check your
              confirmation or contact LawnFlow before starting another.
            </p>
            <a href="/quote/success">View private confirmation</a>
            <p>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => {
                  token.current = "";
                  try {
                    sessionStorage.removeItem(tokenKey);
                  } catch {}
                  setDraft(emptyDraft);
                  setFiles([]);
                  setConflict(false);
                  go(0);
                }}
              >
                Start a separate new request
              </button>
            </p>
          </div>
        )}
        <fieldset disabled={pending} className="quote-fields">
          <legend className="sr-only">{steps[step]} details</legend>
          {step === 0 && (
            <div className="quote-grid">
              {field("firstName", "First name", {
                autoComplete: "given-name",
                maxLength: 100,
              })}
              {field("lastName", "Last name", {
                autoComplete: "family-name",
                maxLength: 100,
              })}
              {field("email", "Email", {
                type: "email",
                autoComplete: "email",
                maxLength: 254,
              })}
              {field("phone", "Mobile number", {
                type: "tel",
                autoComplete: "tel",
                maxLength: 30,
                placeholder: "082 123 4567 or +27…",
              })}
            </div>
          )}
          {step === 1 && (
            <>
              <p>
                We’ll confirm whether we can help at your address during review.
              </p>
              <div className="quote-grid">
                {field("addressLine1", "Address line 1", {
                  autoComplete: "address-line1",
                  maxLength: 200,
                })}
                {field("addressLine2", "Address line 2 (optional)", {
                  autoComplete: "address-line2",
                  maxLength: 200,
                })}
                {field("suburb", "Suburb", {
                  autoComplete: "address-level3",
                  maxLength: 100,
                })}
                {field("city", "City", {
                  autoComplete: "address-level2",
                  maxLength: 100,
                })}
                {field("province", "Province", {
                  autoComplete: "address-level1",
                  maxLength: 100,
                })}
                {field("postalCode", "Postal code", {
                  autoComplete: "postal-code",
                  inputMode: "numeric",
                  maxLength: 4,
                })}
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <p>Select one or more services.</p>
              <div
                className="quote-services"
                id="serviceIds"
                tabIndex={-1}
                role="group"
                aria-label="Available services"
                aria-describedby={
                  errors.serviceIds ? "serviceIds-error" : undefined
                }
              >
                {services.map((service) => (
                  <label className="quote-service" key={service.id}>
                    <input
                      type="checkbox"
                      checked={draft.serviceIds.includes(service.id)}
                      onChange={(event) =>
                        set(
                          "serviceIds",
                          event.target.checked
                            ? [...draft.serviceIds, service.id]
                            : draft.serviceIds.filter(
                                (id) => id !== service.id,
                              ),
                        )
                      }
                    />
                    <span>
                      <strong>{service.name}</strong>
                      <span>{service.shortDescription}</span>
                    </span>
                  </label>
                ))}
              </div>
              {errors.serviceIds && (
                <p id="serviceIds-error" className="quote-error">
                  {errors.serviceIds}
                </p>
              )}
            </>
          )}
          {step === 3 && (
            <>
              <p>
                Size is a rough category, not an exact measurement. Choose “Not
                sure” whenever you need our help.
              </p>
              <p>
                Small: a compact residential lawn. Medium: an average
                residential lawn. Large: a large garden or property.
              </p>
              <div className="quote-grid">
                {select("propertyType", "Property type", propertyTypes)}
                {select("lawnSizeCategory", "Lawn size", lawnSizes)}
                {select("lawnCondition", "Lawn condition", lawnConditions)}
                {select("frequency", "Service frequency", frequencies)}
              </div>
            </>
          )}
          {step === 4 && (
            <>
              <p>
                Photos are optional. Show the garden, not people or sensitive
                documents. Up to {limits.maxFiles} JPEG, PNG or WebP photos,{" "}
                {limits.maxFileBytes / 1048576} MB each and 31 MB combined.
                Non-animated images under 20 megapixels only.
              </p>
              <div className="quote-field">
                <label htmlFor="photos">Add garden photos (optional)</label>
                <input
                  id="photos"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  aria-invalid={!!errors.photos}
                  onChange={(event) => {
                    const next = [
                      ...files,
                      ...Array.from(event.target.files ?? []),
                    ];
                    const error = photoSelectionError(next, limits);
                    if (error) setErrors({ photos: error });
                    else {
                      setFiles(next);
                      setErrors({});
                    }
                    event.target.value = "";
                  }}
                />
              </div>
              <ul className="quote-photos">
                {files.map((file, index) => (
                  <PhotoPreview
                    key={`${file.name}-${file.lastModified}-${index}`}
                    file={file}
                    index={index}
                    remove={() => {
                      setFiles((old) => old.filter((_, i) => i !== index));
                      setErrors({});
                    }}
                  />
                ))}
              </ul>
            </>
          )}
          {step === 5 && (
            <div className="quote-field">
              <label htmlFor="notes">
                Tell us anything else about your lawn or garden (optional)
              </label>
              <textarea
                id="notes"
                rows={6}
                maxLength={2000}
                value={draft.notes}
                onChange={(event) => set("notes", event.target.value)}
                aria-invalid={!!errors.notes}
                aria-describedby="notes-count"
              />
              <p id="notes-count">
                {draft.notes.length} / 2,000 characters. Please leave out
                sensitive personal information.
              </p>
            </div>
          )}
          {step === 6 && (
            <>
              <p>
                Check your details before sending. Your request needs review
                before a price or appointment can be confirmed.
              </p>
              <dl className="quote-review">
                <div>
                  <dt>
                    Contact{" "}
                    <button type="button" onClick={() => go(0)}>
                      Edit contact
                    </button>
                  </dt>
                  <dd>
                    {draft.firstName} {draft.lastName}
                    <br />
                    {draft.email}
                    <br />
                    {draft.phone}
                  </dd>
                </div>
                <div>
                  <dt>
                    Location{" "}
                    <button type="button" onClick={() => go(1)}>
                      Edit location
                    </button>
                  </dt>
                  <dd>
                    {[
                      draft.addressLine1,
                      draft.addressLine2,
                      draft.suburb,
                      draft.city,
                      draft.province,
                      draft.postalCode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </dd>
                </div>
                <div>
                  <dt>
                    Services{" "}
                    <button type="button" onClick={() => go(2)}>
                      Edit services
                    </button>
                  </dt>
                  <dd>
                    {services
                      .filter((service) =>
                        draft.serviceIds.includes(service.id),
                      )
                      .map((service) => service.name)
                      .join(", ")}
                  </dd>
                </div>
                <div>
                  <dt>
                    Property{" "}
                    <button type="button" onClick={() => go(3)}>
                      Edit property
                    </button>
                  </dt>
                  <dd>
                    {propertyTypes[draft.propertyType]}
                    <br />
                    Lawn size: {lawnSizes[draft.lawnSizeCategory]}
                    <br />
                    Condition: {lawnConditions[draft.lawnCondition]}
                    <br />
                    Frequency: {frequencies[draft.frequency]}
                  </dd>
                </div>
                <div>
                  <dt>
                    Photos{" "}
                    <button type="button" onClick={() => go(4)}>
                      Edit photos
                    </button>
                  </dt>
                  <dd>{files.length} selected</dd>
                </div>
                <div>
                  <dt>
                    Notes{" "}
                    <button type="button" onClick={() => go(5)}>
                      Edit notes
                    </button>
                  </dt>
                  <dd>{draft.notes || "No additional notes"}</dd>
                </div>
              </dl>
              <label className="quote-consent">
                <input
                  id="consent"
                  type="checkbox"
                  checked={draft.consent}
                  onChange={(event) => set("consent", event.target.checked)}
                  aria-invalid={!!errors.consent}
                  aria-describedby={
                    errors.consent ? "consent-error" : undefined
                  }
                />
                <span>{privacyNotice}</span>
              </label>
              {errors.consent && (
                <p id="consent-error" className="quote-error">
                  {errors.consent}
                </p>
              )}
            </>
          )}
        </fieldset>
        <div className="quote-actions">
          {step > 0 && (
            <button
              type="button"
              className="button button-secondary"
              disabled={pending}
              onClick={() => go(step - 1)}
            >
              Back
            </button>
          )}
          <button
            className="button button-primary"
            type="submit"
            disabled={pending}
          >
            {pending
              ? "Sending request…"
              : step === 6
                ? "Submit quote request"
                : "Next"}
          </button>
        </div>
        <p className="quote-footnote">
          Your details stay in this form until you submit. Refreshing clears
          unfinished details. If submission fails, keep this page open and
          retry.
        </p>
      </div>
    </form>
  );
}
