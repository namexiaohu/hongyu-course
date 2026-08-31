type Props = {
  unitTitle: string;
  lessonTitle: string;
  meta: string;
};

export function HeroResume({ unitTitle, lessonTitle, meta }: Props) {
  return (
    <div className="hero__resume">
      <p className="hero__resume-lesson">{unitTitle} / {lessonTitle}</p>
      <p className="hero__resume-meta">{meta}</p>
    </div>
  );
}
