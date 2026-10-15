import { Link } from "react-router-dom";

export function Loading({ text = "Loading..." }) {
  return (
    <div className="state" role="status">
      <div className="spinner" />
      <p>{text}</p>
    </div>
  );
}

export function ErrorState({ title = "Something went wrong.", message, onRetry }) {
  return (
    <div className="state state-error" role="alert">
      <h2>{title}</h2>
      {message && <p>{message}</p>}
      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon, title, text, to, cta }) {
  return (
    <div className="state">
      {icon && <div className="state-icon">{icon}</div>}
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      {to && (
        <Link className="btn btn-primary" to={to}>
          {cta}
        </Link>
      )}
    </div>
  );
}
