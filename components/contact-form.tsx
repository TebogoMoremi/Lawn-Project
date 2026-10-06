"use client";

import { useState, type FormEvent } from "react";
import {
  validateContact,
  type ContactDraft,
  type ContactErrors,
} from "@/lib/contact";

const fields: {
  name: keyof ContactDraft;
  label: string;
  type: string;
  autoComplete?: string;
  maxLength: number;
}[] = [
  {
    name: "name",
    label: "Name",
    type: "text",
    autoComplete: "name",
    maxLength: 100,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    autoComplete: "email",
    maxLength: 254,
  },
  {
    name: "mobile",
    label: "Mobile Number",
    type: "tel",
    autoComplete: "tel",
    maxLength: 30,
  },
  { name: "subject", label: "Subject", type: "text", maxLength: 120 },
  { name: "message", label: "Message", type: "textarea", maxLength: 2000 },
];

export function ContactForm() {
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState("");
  function checkDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const draft: ContactDraft = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      mobile: String(data.get("mobile") ?? ""),
      subject: String(data.get("subject") ?? ""),
      message: String(data.get("message") ?? ""),
    };
    const nextErrors = validateContact(draft);
    setErrors(nextErrors);
    const firstInvalid = fields.find((field) => nextErrors[field.name]);
    if (firstInvalid) {
      setStatus("Please check the highlighted fields. Nothing has been sent.");
      form.querySelector<HTMLElement>(`[name="${firstInvalid.name}"]`)?.focus();
    } else {
      setStatus(
        "Your draft passes validation. Nothing has been sent or saved by LawnFlow. Online message delivery is not connected yet.",
      );
    }
  }
  return (
    <form
      className="contact-form"
      method="dialog"
      noValidate
      onSubmit={checkDraft}
      aria-describedby="form-notice"
      onChange={() => setStatus("")}
    >
      <p id="form-notice">
        Preview only: you can check a draft here, but this form cannot send
        messages. All fields are required. Please use sample details while
        trying it.
      </p>
      {fields.map((field) => (
        <div
          className={
            field.name === "message" ? "form-field full-width" : "form-field"
          }
          key={field.name}
        >
          <label htmlFor={`contact-${field.name}`}>
            {field.label} <span aria-hidden="true">*</span>
          </label>
          {field.type === "textarea" ? (
            <textarea
              id={`contact-${field.name}`}
              name={field.name}
              required
              minLength={10}
              maxLength={field.maxLength}
              rows={6}
              aria-invalid={Boolean(errors[field.name])}
              aria-describedby={
                errors[field.name] ? `${field.name}-error` : undefined
              }
            />
          ) : (
            <input
              id={`contact-${field.name}`}
              name={field.name}
              type={field.type}
              required
              maxLength={field.maxLength}
              autoComplete={field.autoComplete}
              aria-invalid={Boolean(errors[field.name])}
              aria-describedby={
                errors[field.name] ? `${field.name}-error` : undefined
              }
            />
          )}
          {errors[field.name] && (
            <p className="field-error" id={`${field.name}-error`}>
              {errors[field.name]}
            </p>
          )}
        </div>
      ))}
      <button className="button button-primary" type="submit">
        Check draft · does not send
      </button>
      <p role="status" className="form-status">
        {status}
      </p>
      <noscript>
        This preview needs JavaScript to check a draft. Message delivery is
        unavailable.
      </noscript>
    </form>
  );
}
