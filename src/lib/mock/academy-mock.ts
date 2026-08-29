export const UNSPLASH = {
  welcome: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&q=80&auto=format&fit=crop',
  learning: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&q=80&auto=format&fit=crop',
  exam: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&q=80&auto=format&fit=crop',
  credential: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1200&q=80&auto=format&fit=crop',
  auth: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&q=80&auto=format&fit=crop',
};

export const MOCK_USER = {
  name: 'Dr. Li',
  certificateTitle: 'Small Animal Clinical Practice Professional Certificate',
  progress: 33,
};

export const MOCK_MODULES = [
  {
    id: 'm1',
    title: 'Module 1: Foundations',
    lessons: [
      { id: 'l1', title: 'Introduction to Clinical Practice', duration: '12 min', type: 'video' },
      { id: 'l2', title: 'Patient Assessment', duration: '18 min', type: 'video' },
      { id: 'l3', title: 'Reading Materials', duration: '10 min', type: 'reading' },
    ],
  },
  {
    id: 'm2',
    title: 'Module 2: Diagnostics',
    lessons: [
      { id: 'l4', title: 'Laboratory Basics', duration: '15 min', type: 'video' },
      { id: 'l5', title: 'Case Study Quiz', duration: '8 min', type: 'quiz' },
    ],
  },
];

export const MOCK_EXAM = {
  title: 'Course Final Exam',
  passScore: 80,
  totalQuestions: 10,
  timeLimitMinutes: 45,
  questions: [
    {
      id: 'q1',
      type: 'single',
      prompt: 'Which parameter is most useful for assessing dehydration in dogs?',
      options: ['Heart rate', 'Skin turgor', 'Tail position', 'Coat color'],
      answer: 1,
    },
    {
      id: 'q2',
      type: 'multiple',
      prompt: 'Select all components of a minimum patient database.',
      options: ['History', 'Physical exam', 'Complete blood count', 'Environmental temperature'],
      answer: [0, 1, 2],
    },
  ],
};

export const MOCK_EXAM_RESULT = {
  passed: true,
  score: 86,
  correctCount: 8,
  totalQuestions: 10,
  timeUsedMinutes: 32,
};

export const MOCK_CREDENTIAL = {
  learnerName: 'Dr. Li Chen',
  certificateTitle: 'Small Animal Clinical Practice Professional Certificate',
  issuedAt: 'August 29, 2026',
  credentialId: 'HONGYU-AC-2026-000128',
};
