import { client, isSanityConfigured } from './sanity'

// Mock data for projects and other application data
export interface Project {
  id: number | string;
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
    title: 'AI-Powered Intelligent Evaluation and Feedback System',
    description: 'We want to make A/O levels tests easier and accessible for teachers to evaluate students and provide feedback. We are currently working on a project to evaluate students based on their performance and provide feedback using detailed analytics.',
    image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags: ['React', 'TypeScript', 'SQLite', 'ASP.NET Core', 'EF Core', 'AI'],
    category: 'EdTech',
    date: 'May 2025',
    duration: '3 months',
    features: [
      'Auto Evaluation system with AI',
      'Question generation system using AI',
      'Student & Course performance tracking and analytics',
    ],
    githubUrl: 'https://github.com/ashikul/ai-evaluation-system',
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
  },
  {
    id: 3,
    title: 'ASP.NET Core Enterprise ERP System',
    description: 'Designed and implemented a scalable, multi-tenant ERP platform for enterprise resource management, optimizing operational workflows, real-time inventory sync, and complex financial reporting pipelines.',
    image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags: ['ASP.NET Core', 'PostgreSQL', 'EF Core', 'Docker', 'Redis', 'Tailwind CSS'],
    category: 'Enterprise',
    date: 'Jan 2025',
    duration: '4 months',
    features: [
      'Multi-tenant database isolation strategies',
      'Automated background inventory synchronization using Hangfire',
      'OAuth2/OIDC centralized authentication using Duende IdentityServer',
    ],
    githubUrl: 'https://github.com/ashikul/erp-platform',
    projectUrl: '',
    isLive: false,
    type: 'application'
  },
  {
    id: 4,
    title: 'Agile Project Management Dashboard',
    description: 'A collaborative project management board featuring interactive Kanban dashboards, team productivity telemetry, and automated sprint tracking metrics for distributed teams.',
    image: 'https://images.pexels.com/photos/7376/startup-photos.jpg?auto=compress&cs=tinysrgb&w=600',
    tags: ['React', 'Node.js', 'Express', 'PostgreSQL', 'WebSocket', 'GSAP'],
    category: 'Productivity',
    date: 'Nov 2024',
    duration: '2 months',
    features: [
      'Real-time card movements and team boards sync using WebSockets',
      'Automated agile metrics including cumulative flow and velocity',
      'Stunning animated layouts and interactions with GSAP',
    ],
    githubUrl: 'https://github.com/ashikul/agile-dashboard',
    projectUrl: 'https://agile-board.demo',
    isLive: true,
    type: 'application'
  },
  {
    id: 5,
    title: 'Distributed Intrusion Detection System',
    description: 'Engineered a highly resilient intrusion detection system that captures and parses network traffic packets in real-time, performing heuristic anomaly scans to preemptively halt DDoS attacks.',
    image: 'https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags: ['Python', 'Scapy', 'React', 'TypeScript', 'Tailwind CSS', 'Docker'],
    category: 'Cyber Security',
    date: 'Sep 2024',
    duration: '3 months',
    features: [
      'Real-time packet capture and logging engine',
      'Heuristic anomaly detection with multi-threaded scanner',
      'Web dashboard showing active threats and geographical IPs mapping',
    ],
    githubUrl: 'https://github.com/ashikul/intrusion-detection',
    projectUrl: '',
    isLive: false,
    type: 'application'
  },
  {
    id: 6,
    title: 'K8s DevOps Telemetry Platform',
    description: 'A custom developer telemetry system built to monitor Kubernetes cluster orchestrations, aggregating Prometheus scraping metrics into interactive Grafana-style visual pipelines.',
    image: 'https://images.pexels.com/photos/3183181/pexels-photo-3183181.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags: ['Go', 'Kubernetes', 'Prometheus', 'Grafana', 'React', 'Docker'],
    category: 'DevOps',
    date: 'Jul 2024',
    duration: '2 months',
    features: [
      'Automated scraper integration for custom cluster namespaces',
      'Dynamic threshold alerting with Slack webhook triggers',
      'Zero-config Helm chart deployment scripts included',
    ],
    githubUrl: 'https://github.com/ashikul/k8s-telemetry',
    projectUrl: '',
    isLive: false,
    type: 'application'
  }
];

// Helper functions for projects
export const getProjects = async (filters?: {
  search?: string;
  category?: string;
  limit?: number;
  page?: number;
}) => {
  let projectsList: Project[] = [...mockProjects];

  if (isSanityConfigured && client) {
    try {
      const query = `*[_type == "project"] | order(date desc, _createdAt desc) {
        "id": _id,
        title,
        description,
        image,
        tags,
        category,
        date,
        duration,
        features,
        githubUrl,
        projectUrl,
        isLive,
        type
      }`;
      const sanityProjects = await client.fetch<any[]>(query);
      // Only replace mock data when Sanity actually returns items
      if (sanityProjects && sanityProjects.length > 0) {
        const { urlFor } = await import('./sanity');
        projectsList = sanityProjects.map(proj => ({
          ...proj,
          image: proj.image && typeof proj.image === 'object' ? urlFor(proj.image) : (proj.image || '')
        }));
      }
    } catch (error) {
      console.error('Error fetching projects from Sanity, falling back to mock data:', error);
    }
  }

  let filteredProjects = [...projectsList];

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
      project => project.category.toLowerCase() === filters.category?.toLowerCase()
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

export const getFeaturedProjects = async (): Promise<Project[]> => {
  if (isSanityConfigured && client) {
    try {
      // Only query the `hero` document type — `landingPage` has been removed
      const query = `*[_type == "hero"][0] {
        featuredProjects[defined(@->)]->{
          "id": _id,
          title,
          description,
          image,
          tags,
          category,
          date,
          duration,
          features,
          githubUrl,
          projectUrl,
          isLive,
          type
        }
      }`;
      const result = await client.fetch<any>(query);
      if (result && result.featuredProjects && result.featuredProjects.length > 0) {
        const { urlFor } = await import('./sanity');
        return result.featuredProjects
          .filter(Boolean)
          .map((proj: any) => ({
            ...proj,
            image: proj.image && typeof proj.image === 'object' ? urlFor(proj.image) : (proj.image || '')
          }));
      }
    } catch (error) {
      console.error('Error fetching featured projects from Sanity:', error);
    }
  }
  // Fallback: return the first 3 projects from getProjects
  const res = await getProjects();
  return res.projects.slice(0, 3);
};

export const getProjectById = async (id: number | string): Promise<Project | undefined> => {
  if (isSanityConfigured && client) {
    try {
      const query = `*[_type == "project" && _id == $id][0] {
        "id": _id,
        title,
        description,
        image,
        tags,
        category,
        date,
        duration,
        features,
        githubUrl,
        projectUrl,
        isLive,
        type
      }`
      const proj = await client.fetch<any>(query, { id });
      if (proj) {
        const { urlFor } = await import('./sanity');
        return {
          ...proj,
          image: proj.image && typeof proj.image === 'object' ? urlFor(proj.image) : (proj.image || '')
        };
      }
    } catch (error) {
      console.error(`Error fetching project ${id} from Sanity, falling back to mock data:`, error);
    }
  }
  return mockProjects.find(project => project.id === id || String(project.id) === String(id));
};

export const getProjectCategories = async (): Promise<string[]> => {
  if (isSanityConfigured && client) {
    try {
      const query = `*[_type == "project"].category`;
      const categories = await client.fetch<string[]>(query);
      if (categories && categories.length > 0) {
        const unique = [...new Set(categories.filter(Boolean))];
        return unique.sort();
      }
    } catch (error) {
      console.error('Error fetching project categories from Sanity, falling back to mock data:', error);
    }
  }
  const categories = [...new Set(mockProjects.map(project => project.category))];
  return categories.sort();
};

export const getProjectStats = async () => {
  let projectsList: Project[] = [...mockProjects];
  if (isSanityConfigured && client) {
    try {
      const query = `*[_type == "project"] {
        "id": _id,
        category,
        tags
      }`;
      const sanityProjects = await client.fetch<any[]>(query);
      if (sanityProjects && sanityProjects.length > 0) {
        projectsList = sanityProjects;
      }
    } catch (error) {
      console.error('Error fetching project stats from Sanity, falling back to mock data:', error);
    }
  }
  
  const categories = [...new Set(projectsList.map(project => project.category).filter(Boolean))].sort();
  const categoryStats = categories.map(category => ({
    category,
    count: projectsList.filter(project => project.category === category).length
  }));

  return {
    totalProjects: projectsList.length,
    categories: categoryStats,
    totalTechnologies: [...new Set(projectsList.flatMap(project => project.tags || []))].length,
    averageDuration: '4.5 months',
  };
};