// Mock data for projects and other application data
export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string;
  tags: string[];
  category: string;
  date: string;
  team: string;
  duration: string;
  features: string[];
  githubUrl: string;
  demoUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'new' | 'read' | 'replied';
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  message: string;
  avatar: string;
  rating: number;
}

export interface Skill {
  id: number;
  name: string;
  category: 'development' | 'management' | 'tools';
  level: number; // 1-100
  description: string;
  icon: string;
}

// Mock Projects Data
export const mockProjects: Project[] = [
  {
    id: 1,
    title: 'E-Commerce Platform',
    slug: 'e-commerce-platform',
    description: 'A comprehensive e-commerce solution with advanced analytics, inventory management, and multi-vendor support. Built for scalability and performance with modern technologies.',
    image: 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags: ['Next.js', 'TypeScript', 'PostgreSQL', 'Stripe', 'Redis', 'Docker'],
    category: 'E-Commerce',
    date: 'Nov 2024',
    team: '5 developers',
    duration: '4 months',
    features: [
      'Multi-vendor marketplace functionality',
      'Advanced analytics and reporting',
      'Secure payment processing with Stripe',
      'Real-time inventory management',
      'Customer review and rating system',
      'Mobile-responsive design'
    ],
    githubUrl: 'https://github.com/ashikul/ecommerce-platform',
    demoUrl: 'https://ecommerce-demo.ashikulbari.dev',
    createdAt: '2024-07-01T00:00:00Z',
    updatedAt: '2024-11-01T00:00:00Z'
  },
  {
    id: 2,
    title: 'Healthcare Management System',
    slug: 'healthcare-management-system',
    description: 'Digital healthcare platform with patient records, appointment scheduling, and telemedicine capabilities. HIPAA compliant and secure.',
    image: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags: ['Angular', 'ASP.NET Core', 'PostgreSQL', 'Azure', 'SignalR'],
    category: 'Healthcare',
    date: 'Mar 2024',
    team: '10 members',
    duration: '8 months',
    features: [
      'Electronic health records (EHR)',
      'Appointment scheduling system',
      'Telemedicine video consultations',
      'Prescription management',
      'Insurance claim processing',
      'HIPAA compliance and security'
    ],
    githubUrl: 'https://github.com/ashikul/healthcare-system',
    demoUrl: 'https://healthcare-demo.ashikulbari.dev',
    createdAt: '2023-07-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z'
  }
];

// Mock Testimonials Data
export const mockTestimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'CTO',
    company: 'TechStart Inc.',
    message: 'Ashikul delivered an exceptional e-commerce platform that exceeded our expectations. His technical expertise and project management skills are outstanding.',
    avatar: 'https://images.pexels.com/photos/3762800/pexels-photo-3762800.jpeg?auto=compress&cs=tinysrgb&w=150',
    rating: 5
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Product Manager',
    company: 'InnovateWeb Solutions',
    message: 'Working with Ashikul was a game-changer for our project. His ability to lead teams and deliver quality solutions on time is remarkable.',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    rating: 5
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Founder',
    company: 'HealthTech Solutions',
    message: 'The healthcare management system Ashikul built for us has transformed our operations. His attention to detail and security compliance is impressive.',
    avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150',
    rating: 5
  }
];

// Mock Skills Data
export const mockSkills: Skill[] = [
  // Development Skills
  { id: 1, name: 'ASP.NET Core', category: 'development', level: 95, description: 'Enterprise web applications', icon: 'code' },
  { id: 2, name: 'Angular', category: 'development', level: 90, description: 'Dynamic web interfaces', icon: 'code' },
  { id: 3, name: 'Python', category: 'development', level: 85, description: 'Backend development & automation', icon: 'code' },
  { id: 4, name: 'PostgreSQL', category: 'development', level: 88, description: 'Relational database management', icon: 'database' },
  { id: 5, name: 'MongoDB', category: 'development', level: 82, description: 'NoSQL database solutions', icon: 'database' },
  
  // Management Skills
  { id: 6, name: 'Agile/Scrum', category: 'management', level: 92, description: 'Iterative project delivery', icon: 'zap' },
  { id: 7, name: 'Team Leadership', category: 'management', level: 88, description: 'Cross-functional team management', icon: 'users' },
  { id: 8, name: 'Strategic Planning', category: 'management', level: 85, description: 'Long-term project roadmaps', icon: 'target' },
  { id: 9, name: 'Risk Management', category: 'management', level: 80, description: 'Project risk assessment', icon: 'shield' },
  
  // Tools
  { id: 10, name: 'Docker', category: 'tools', level: 85, description: 'Containerization & deployment', icon: 'container' },
  { id: 11, name: 'AWS/Cloud', category: 'tools', level: 82, description: 'Cloud infrastructure & services', icon: 'cloud' },
  { id: 12, name: 'Git/GitHub', category: 'tools', level: 90, description: 'Version control & collaboration', icon: 'git-branch' }
];

// Mock Contact Messages (for demonstration)
export const mockContactMessages: ContactMessage[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    subject: 'Project Collaboration',
    message: 'Hi Ashikul, I would like to discuss a potential project collaboration. We are looking for a full-stack developer with project management experience.',
    createdAt: '2024-01-15T10:30:00Z',
    status: 'new'
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@techcorp.com',
    subject: 'Consulting Opportunity',
    message: 'We are interested in your consulting services for our upcoming e-commerce project. Could we schedule a call to discuss the requirements?',
    createdAt: '2024-01-14T14:20:00Z',
    status: 'read'
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

export const getProjectBySlug = (slug: string): Project | undefined => {
  return mockProjects.find(project => project.slug === slug);
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
    totalTeamMembers: mockProjects.reduce((sum, project) => {
      const teamSize = parseInt(project.team.split(' ')[0]) || 0;
      return sum + teamSize;
    }, 0)
  };
};

// Helper functions for testimonials
export const getTestimonials = (limit?: number) => {
  const testimonials = limit ? mockTestimonials.slice(0, limit) : mockTestimonials;
  return {
    testimonials,
    total: mockTestimonials.length
  };
};

// Helper functions for skills
export const getSkills = (category?: 'development' | 'management' | 'tools') => {
  const skills = category 
    ? mockSkills.filter(skill => skill.category === category)
    : mockSkills;
  
  return {
    skills,
    total: skills.length
  };
};

// Helper functions for contact messages
export const getContactMessages = (status?: 'new' | 'read' | 'replied') => {
  const messages = status 
    ? mockContactMessages.filter(message => message.status === status)
    : mockContactMessages;
  
  return {
    messages,
    total: messages.length
  };
};

// Simulate API delay for realistic loading states
export const simulateApiDelay = (ms: number = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Mock form submission handler
export const submitContactForm = async (formData: {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}) => {
  await simulateApiDelay(1000); // Simulate network delay
  
  const newMessage: ContactMessage = {
    id: mockContactMessages.length + 1,
    ...formData,
    createdAt: new Date().toISOString(),
    status: 'new'
  };
  
  mockContactMessages.push(newMessage);
  
  return {
    success: true,
    message: 'Thank you for your message! I will get back to you soon.',
    data: newMessage
  };
};