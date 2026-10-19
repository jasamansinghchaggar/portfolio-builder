export const templates = [
  { id: 'atelier', name: 'Atelier', description: 'Warm, expressive, and personal', tone: 'sand' },
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'A considered, magazine-inspired layout',
    tone: 'rose',
  },
  { id: 'mono', name: 'Mono', description: 'Crisp, modern, and minimal', tone: 'blue' },
] as const;

export const sectionCatalog = [
  { type: 'hero', label: 'Introduction', note: 'A strong first impression' },
  { type: 'about', label: 'About', note: 'Your story and point of view' },
  { type: 'projects', label: 'Selected work', note: 'Projects you are proud of' },
  { type: 'experience', label: 'Experience', note: 'Your professional journey' },
  { type: 'skills', label: 'Skills', note: 'What you bring to the table' },
  { type: 'education', label: 'Education', note: 'Your learning journey' },
  { type: 'certifications', label: 'Certifications', note: 'Credentials and qualifications' },
  { type: 'services', label: 'Services', note: 'How you can help' },
  { type: 'testimonials', label: 'Testimonials', note: 'What people say about you' },
  { type: 'achievements', label: 'Achievements', note: 'Milestones worth sharing' },
  { type: 'contact', label: 'Contact', note: 'Make it easy to connect' },
  { type: 'resume', label: 'Resume / CV', note: 'A concise professional overview' },
  { type: 'team', label: 'Team', note: 'Introduce your organization' },
  { type: 'case-studies', label: 'Case studies', note: 'Show your process and impact' },
] as const;
