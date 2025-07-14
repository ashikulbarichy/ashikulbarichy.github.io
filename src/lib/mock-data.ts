// Mock data for projects and other application data
export interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  tags: string[];
  category: string;
  date: string;
  duration: string;
  features: string[];
  githubUrl: string;
  projectUrl: string;
  isLive: boolean;
  type: 'application' | 'case-study' | 'research';
}

// Mock Projects Data
export const mockProjects: Project[] = [
  {
    id: 1,
    title: 'AI Powered Intellegent evaluation and feedback system',
    description: 'We want to make A/O levels tests easier and accessible for teachers to evaluate students and provide feedback. We are currently working on a project to evaluate students based on their performance and provide feedback using detailed analytics.',
    image: 'https://api.ajackus.com/wp-content/uploads/2022/01/AI-Powered-technologies-transformation-2022.png',
    tags: ['React', 'TypeScript', 'SQLite', 'ASP.NET', 'EF Core', 'Github', 'AI'],
    category: 'EdTech',
    date: 'May 2025',
    duration: '3 months',
    features: [
      'Auto Evaluation system with AI',
      'Question generation system using AI',
      'Student & Course performance tracking and analytics',
    ],
    githubUrl: 'https://github.com/ashikul/ecommerce-platform',
    projectUrl: 'https://ai-eval-demo.com',
    isLive: false,
    type: 'application'
  },
  {
    id: 2,
    title: 'Quantum ML Research',
    description: 'We are conducting research on how quantum machine learning can be used to solve real world problems in healthcare domain. We are currently working on a project to identify early stage kidney stone using ultrasound images using quantum machine learning.',
    image: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags: ['QISKIT', 'IBM', 'Python', 'Computer Vision'],
    category: 'Healthcare',
    date: 'May 2025',
    duration: '3+ months',
    features: [
      'Ultrasound Image Analysis',
      'No stone or stone prediction',
    ],
    githubUrl: 'https://github.com/ashikul/healthcare-system',
    projectUrl: '',
    isLive: false,
    type: 'research'
  }
];

// Helper functions for projects
export const getProjects = (filters?: {
  search?: string;
  category?: string;
  limit?: number;
  page?: number;
}) => {
  let filteredProjects = [...mockProjects];

  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredProjects = filteredProjects.filter(
      project =>
        project.title.toLowerCase().includes(searchTerm) ||
        project.description.toLowerCase().includes(searchTerm) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  if (filters?.category && filters.category !== 'all') {
    filteredProjects = filteredProjects.filter(
      project => project.category === filters.category
    );
  }

  const page = filters?.page || 1;
  const limit = filters?.limit || filteredProjects.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

  return {
    projects: paginatedProjects,
    total: filteredProjects.length,
    page,
    totalPages: Math.ceil(filteredProjects.length / limit)
  };
};

export const getProjectById = (id: number): Project | undefined => {
  return mockProjects.find(project => project.id === id);
};

export const getProjectCategories = (): string[] => {
  const categories = [...new Set(mockProjects.map(project => project.category))];
  return categories.sort();
};

export const getProjectStats = () => {
  const categories = getProjectCategories();
  const categoryStats = categories.map(category => ({
    category,
    count: mockProjects.filter(project => project.category === category).length
  }));

  return {
    totalProjects: mockProjects.length,
    categories: categoryStats,
    totalTechnologies: [...new Set(mockProjects.flatMap(project => project.tags))].length,
    averageDuration: '4.5 months',
  };
};