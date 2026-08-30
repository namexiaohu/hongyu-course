import Link from 'next/link';

type Props = {
  href: string;
  title: string;
  coverImage?: string;
  certificateTitle: string;
  subtitle: string;
};

export function CourseListCard({ href, title, coverImage, certificateTitle, subtitle }: Props) {
  return (
    <Link href={href} className="course-list-card">
      <div className="course-list-thumb">
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImage} alt="" />
        ) : null}
      </div>
      <div className="course-list-info">
        <div className="course-list-provider">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18" />
          </svg>
          {certificateTitle}
        </div>
        <div className="course-list-title">{title}</div>
        <div className="course-list-meta">{subtitle}</div>
      </div>
    </Link>
  );
}
