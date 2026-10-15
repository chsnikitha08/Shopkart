import { useRef, useState } from "react";

const Svg = ({ children }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const ICONS = {
  user: <Svg><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></Svg>,
  mail: <Svg><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></Svg>,
  lock: <Svg><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></Svg>,
  phone: <Svg><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></Svg>,
  eye: <Svg><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></Svg>,
  eyeOff: <Svg><path d="M3 3l18 18" /><path d="M10.6 6.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 6.5A17 17 0 0 0 2 12s3.6 7 10 7a9.700 9.700 0 0 0 4.200-.9" /><path d="M9.900 9.900a3 3 0 0 0 4.200 4.200" /></Svg>,
  check: <Svg><path d="m5 12.500 4.500 4.500L19 7.500" /></Svg>,
};

export default function AuthField({
  id,
  name,
  label,
  type = "text",
  icon,
  value,
  onChange,
  error,
  autoComplete,
  valid = false,
  required = false,
}) {
  const inputRef = useRef(null);
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="af-wrap">
      <div className={`af ${error ? "af-error" : ""}`} onClick={() => inputRef.current?.focus()}>
        <span className="af-icon">{ICONS[icon]}</span>

        <div className="af-body">
          <label htmlFor={id}>{label}</label>
          <input
            ref={inputRef}
            id={id}
            name={name}
            type={isPassword && show ? "text" : type}
            value={value}
            onChange={onChange}
            autoComplete={autoComplete}
            required={required}
          />
        </div>

        {isPassword && (
          <button
            type="button"
            className="af-toggle"
            onClick={(e) => {
              e.stopPropagation();
              setShow((s) => !s);
            }}
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? ICONS.eyeOff : ICONS.eye}
          </button>
        )}
        {!isPassword && valid && <span className="af-valid">{ICONS.check}</span>}
      </div>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
