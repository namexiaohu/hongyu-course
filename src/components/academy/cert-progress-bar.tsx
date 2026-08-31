type Props = {
  percent: number;
  complete?: boolean;
};

export function CertProgressBar({ percent, complete = false }: Props) {
  const width = Math.min(100, Math.max(0, percent));
  return (
    <div className="cert-progress">
      <div className="cert-progress__track">
        <div
          className={`cert-progress__fill${complete ? ' cert-progress__fill--complete' : ''}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
