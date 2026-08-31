import { CoursesIcon, LearnersIcon } from '@/components/academy/academy-stat-icons';
import { useSiteBranding } from '@/components/providers/site-branding-provider';

type Props = {
  teachersTitle: string;
  primaryStat: string;
  studentsStat: string;
  providerTitle: string;
};

export function AcademyDetailSidebar({
  teachersTitle,
  primaryStat,
  studentsStat,
  providerTitle,
}: Props) {
  const { companyName, positioning } = useSiteBranding();

  return (
    <aside className="sidebar-card">
      <h3 className="sidebar-card__title">{teachersTitle}</h3>
      <div className="instructor-row">
        <div className="instructor-avatar" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M12 2L2 7v10l10 5 10-5V7L12 2z" /></svg>
        </div>
        <div>
          {companyName ? <div className="instructor-name">{companyName}</div> : null}
          {positioning ? <div className="instructor-org">{positioning}</div> : null}
        </div>
      </div>
      <p className="instructor-stats instructor-stats--icons">
        <span className="cert-card__meta-item">
          <CoursesIcon />
          {primaryStat}
        </span>
        <span className="cert-card__meta-dot" aria-hidden>·</span>
        <span className="cert-card__meta-item">
          <LearnersIcon />
          {studentsStat}
        </span>
      </p>
      <hr className="sidebar-divider" />
      <h3 className="sidebar-card__title">{providerTitle}</h3>
      {companyName ? (
        <div className="provider-row">
          <div className="provider-logo" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M12 2L2 7v10l10 5 10-5V7L12 2z" /></svg>
          </div>
          <div className="provider-name">{companyName}</div>
        </div>
      ) : null}
    </aside>
  );
}
