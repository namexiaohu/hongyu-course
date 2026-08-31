export function LearnContentSkeleton() {
  return (
    <div className="learn-content-skeleton" role="status" aria-live="polite" aria-busy="true">
      <div className="learn-content-skeleton__video learn-shimmer" />
      <div className="learn-content-skeleton__title learn-shimmer" />
      <div className="learn-content-skeleton__line learn-shimmer" />
      <div className="learn-content-skeleton__line learn-shimmer learn-content-skeleton__line--short" />
    </div>
  );
}

export function LearnSidebarSkeleton() {
  return (
    <div className="learn-sidebar-skeleton" role="status" aria-live="polite" aria-busy="true">
      <div className="learn-sidebar-skeleton__tab learn-shimmer" />
      <div className="learn-sidebar-skeleton__tab learn-shimmer" />
      <div className="learn-sidebar-skeleton__block learn-shimmer" />
      <div className="learn-sidebar-skeleton__line learn-shimmer" />
      <div className="learn-sidebar-skeleton__line learn-shimmer" />
      <div className="learn-sidebar-skeleton__line learn-shimmer learn-sidebar-skeleton__line--short" />
    </div>
  );
}
