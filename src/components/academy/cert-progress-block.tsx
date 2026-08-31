import { CertProgressBar } from '@/components/academy/cert-progress-bar';

type Props = {
  label: string;
  stat: string;
  percent: number;
  complete?: boolean;
};

export function CertProgressBlock({ label, stat, percent, complete = false }: Props) {
  return (
    <div className="cert-progress-block">
      <div className="cert-progress-block__head">
        <span>{label}</span>
        <span className={complete ? 'cert-progress-block__stat cert-progress-block__stat--complete' : 'cert-progress-block__stat'}>
          {stat}
        </span>
      </div>
      <CertProgressBar percent={percent} complete={complete} />
    </div>
  );
}
