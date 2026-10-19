export default function Alert({ type = 'error', children }) {
  if (!children) return null;

  return (
    <div className={`alert alert--${type}`} role="alert">
      {typeof children === 'string'
        ? children.split('\n').map((line) => <p key={line}>{line}</p>)
        : children}
    </div>
  );
}
