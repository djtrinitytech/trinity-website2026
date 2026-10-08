import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ordersData } from "../data/ordersData";
import { submitRegistration } from "../services/registrationService";
import "./Registrations.css";

const YEARS = ["First Year", "Second Year", "Third Year", "Final Year"];

const EMPTY = {
  fullName: "",
  username: "",
  email: "",
  phone: "",
  altPhone: "",
  college: "",
  department: "",
  year: "",
  consent: false,
};

const digits = (v) => v.replace(/\D/g, "");

// Indian mobile numbers: 10 digits starting 6–9, optionally prefixed with 91 / 0
function isValidPhone(v) {
  let d = digits(v);
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d);
}

function validate(f) {
  const e = {};
  if (f.fullName.trim().length < 2) e.fullName = "Enter your full name.";
  if (!/^[a-z0-9_.]{3,20}$/.test(f.username))
    e.username = "3–20 characters: lowercase letters, numbers, _ or .";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "Enter a valid email address.";
  if (!isValidPhone(f.phone)) e.phone = "Enter a valid 10-digit mobile number.";
  if (f.altPhone.trim()) {
    if (!isValidPhone(f.altPhone)) e.altPhone = "Enter a valid 10-digit mobile number.";
    else if (digits(f.altPhone).slice(-10) === digits(f.phone).slice(-10))
      e.altPhone = "Use a different number from your primary phone.";
  }
  if (f.college.trim().length < 2) e.college = "Enter your college.";
  if (!f.department) e.department = "Select your department.";
  if (!f.year) e.year = "Select your year.";
  if (!f.consent) e.consent = "Please accept to continue.";
  return e;
}

function Field({ id, label, hint, error, optional, children }) {
  return (
    <div className={`reg-field ${error ? "has-error" : ""}`}>
      <label htmlFor={id} className="reg-label">
        {label}
        {optional && <span className="reg-optional">Optional</span>}
      </label>
      {children}
      <p id={`${id}-msg`} className={error ? "reg-error" : "reg-hint"} aria-live="polite">
        {error || hint || " "}
      </p>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="reg-section-title">
      <h2>{children}</h2>
      <span className="reg-section-rule" aria-hidden="true" />
    </div>
  );
}

const Registrations = () => {
  const [form, setForm] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | submitting | done | error

  const errors = useMemo(() => validate(form), [form]);
  const show = (name) => (submitted || touched[name] ? errors[name] : undefined);
  const order = ordersData.find((o) => o.dept === form.department);

  const set = (name) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [name]: name === "username" ? value.toLowerCase() : value }));
  };
  const blur = (name) => () => setTouched((t) => ({ ...t, [name]: true }));

  const inputProps = (name) => ({
    id: `reg-${name}`,
    name,
    value: form[name],
    onChange: set(name),
    onBlur: blur(name),
    "aria-invalid": Boolean(show(name)),
    "aria-describedby": `reg-${name}-msg`,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length) {
      const first = document.querySelector(`#reg-${Object.keys(errors)[0]}`);
      first?.focus();
      return;
    }
    setStatus("submitting");
    try {
      const { consent: _consent, ...payload } = form;
      await submitRegistration({ ...payload, fullName: payload.fullName.trim(), email: payload.email.trim() });
      setStatus("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setStatus("error");
    }
  };

  const reset = () => {
    setForm(EMPTY);
    setTouched({});
    setSubmitted(false);
    setStatus("idle");
  };

  return (
    <section className="reg-page">
      <header className="reg-header">
        <p className="reg-devanagari" lang="hi">
          पंजीकरण
        </p>
        <h1 className="reg-title">Registrations</h1>
        <p className="reg-subtitle">
          Enter the archive. Claim your place among the six orders of Trinity 2026.
        </p>
        <div className="reg-divider" aria-hidden="true">
          <span />
          <i />
          <span />
        </div>
      </header>

      <div className="reg-panel">
        <span className="reg-corner tl" aria-hidden="true" />
        <span className="reg-corner tr" aria-hidden="true" />
        <span className="reg-corner bl" aria-hidden="true" />
        <span className="reg-corner br" aria-hidden="true" />

        {status === "done" ? (
          <div className="reg-success" role="status">
            <div className="reg-seal" aria-hidden="true">
              <svg viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="29" />
                <circle cx="32" cy="32" r="23" strokeDasharray="2 4" />
                <path d="M21 33 29 41 44 25" />
              </svg>
            </div>
            <p className="reg-eyebrow">Registration received</p>
            <h2 className="reg-success-title">Welcome, {form.fullName.trim().split(" ")[0]}.</h2>
            <p className="reg-success-text">
              Your registration{order ? ` for ${order.dept}, as ${order.name},` : ""} has been recorded. A confirmation
              will be sent to <strong>{form.email.trim()}</strong>.
            </p>
            <div className="reg-actions">
              <Link to="/events" className="reg-button">
                Explore the events <span aria-hidden="true">→</span>
              </Link>
              <button type="button" className="reg-link" onClick={reset}>
                Register another participant
              </button>
            </div>
          </div>
        ) : (
          <form className="reg-form" onSubmit={handleSubmit} noValidate>
            <SectionTitle>Identity</SectionTitle>
            <div className="reg-grid">
              <Field id="reg-fullName" label="Full name" error={show("fullName")}>
                <input {...inputProps("fullName")} className="reg-input" autoComplete="name" placeholder="As on your college ID" />
              </Field>
              <Field
                id="reg-username"
                label="Username"
                hint="Shown on leaderboards and your pass."
                error={show("username")}
              >
                <div className="reg-affix">
                  <span className="reg-prefix" aria-hidden="true">@</span>
                  <input
                    {...inputProps("username")}
                    className="reg-input has-prefix"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck="false"
                    maxLength={20}
                    placeholder="your_handle"
                  />
                </div>
              </Field>
            </div>

            <SectionTitle>Contact</SectionTitle>
            <div className="reg-grid reg-grid-3">
              <Field id="reg-email" label="Email address" error={show("email")}>
                <input {...inputProps("email")} type="email" className="reg-input" autoComplete="email" placeholder="name@college.edu" />
              </Field>
              <Field id="reg-phone" label="Phone number" hint="We'll reach you here on event days." error={show("phone")}>
                <div className="reg-affix">
                  <span className="reg-prefix" aria-hidden="true">+91</span>
                  <input
                    {...inputProps("phone")}
                    type="tel"
                    inputMode="tel"
                    className="reg-input has-prefix wide"
                    autoComplete="tel-national"
                    placeholder="98200 12345"
                  />
                </div>
              </Field>
              <Field
                id="reg-altPhone"
                label="Alternate contact"
                optional
                hint="A guardian or teammate."
                error={show("altPhone")}
              >
                <div className="reg-affix">
                  <span className="reg-prefix" aria-hidden="true">+91</span>
                  <input {...inputProps("altPhone")} type="tel" inputMode="tel" className="reg-input has-prefix wide" placeholder="98200 67890" />
                </div>
              </Field>
            </div>

            <SectionTitle>Affiliation</SectionTitle>
            <div className="reg-grid reg-grid-3">
              <Field id="reg-college" label="College" error={show("college")}>
                <input {...inputProps("college")} className="reg-input" autoComplete="organization" placeholder="Your college" />
              </Field>
              <Field id="reg-year" label="Year of study" error={show("year")}>
                <select {...inputProps("year")} className="reg-input reg-select">
                  <option value="" disabled>
                    Select year
                  </option>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                id="reg-department"
                label="Department"
                error={show("department")}
                hint={order ? undefined : "Your department decides your order."}
              >
                <select {...inputProps("department")} className="reg-input reg-select">
                  <option value="" disabled>
                    Select department
                  </option>
                  {ordersData.map((o) => (
                    <option key={o.dept} value={o.dept}>
                      {o.dept}
                    </option>
                  ))}
                </select>
              </Field>
              <div className={`reg-order ${order ? "is-visible" : ""}`} aria-live="polite">
                {order && (
                  <>
                    <img src={order.image} alt="" className="reg-order-emblem" />
                    <div>
                      <p className="reg-order-label">Your order</p>
                      <p className="reg-order-name">
                        {order.dept} <span>as</span> {order.name}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className={`reg-consent ${show("consent") ? "has-error" : ""}`}>
              <label className="reg-check">
                <input
                  type="checkbox"
                  id="reg-consent"
                  checked={form.consent}
                  onChange={set("consent")}
                  aria-invalid={Boolean(show("consent"))}
                  aria-describedby="reg-consent-msg"
                />
                <span className="reg-checkbox" aria-hidden="true" />
                <span>
                  I confirm these details are correct and agree to the Trinity 2026 code of conduct.
                </span>
              </label>
              <p id="reg-consent-msg" className="reg-error" aria-live="polite">
                {show("consent") || " "}
              </p>
            </div>

            {status === "error" && (
              <p className="reg-form-error" role="alert">
                Something went wrong while submitting. Please try again.
              </p>
            )}

            <div className="reg-actions">
              <button type="submit" className="reg-button" disabled={status === "submitting"}>
                {status === "submitting" ? (
                  <>
                    <span className="reg-spinner" aria-hidden="true" /> Inscribing…
                  </>
                ) : (
                  <>
                    Complete registration <span aria-hidden="true">→</span>
                  </>
                )}
              </button>
              <p className="reg-fineprint">Your details are used only for Trinity 2026 communication.</p>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};

export default Registrations;
