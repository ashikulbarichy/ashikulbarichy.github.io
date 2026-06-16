import { createClient } from '@sanity/client';
import fs from 'fs';
import https from 'https';

// Parse .env manually to avoid extra dependencies
const env = fs.readFileSync('.env', 'utf-8')
  .split('\n')
  .reduce((acc, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return acc;
    const [key, ...val] = trimmed.split('=');
    if (key && val.length) acc[key.trim()] = val.join('=').trim();
    return acc;
  }, {});

const client = createClient({
  projectId: env.VITE_SANITY_PROJECT_ID,
  dataset: env.VITE_SANITY_DATASET || 'production',
  apiVersion: env.VITE_SANITY_API_VERSION || '2023-05-03',
  token: env.VITE_SANITY_API_TOKEN,
  useCdn: false,
});

const mockProjects = [
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

async function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${res.statusCode}`));
        return;
      }
      const data = [];
      res.on('data', (chunk) => data.push(chunk));
      res.on('end', () => resolve(Buffer.concat(data)));
    }).on('error', reject);
  });
}

async function upload() {
  console.log(`Starting upload to project ID: ${env.VITE_SANITY_PROJECT_ID}, dataset: ${env.VITE_SANITY_DATASET}`);
  
  for (const proj of mockProjects) {
    console.log(`\n--- Processing project: ${proj.title} ---`);
    let imageValue = proj.image;

    try {
      console.log(`Downloading image from ${proj.image}`);
      const buffer = await downloadImage(proj.image);
      console.log(`Uploading image as asset to Sanity...`);
      const asset = await client.assets.upload('image', buffer, {
        filename: `${proj.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpg`,
      });
      imageValue = {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: asset._id,
        },
      };
      console.log(`Image uploaded successfully! Asset ID: ${asset._id}`);
    } catch (err) {
      console.error(`Failed to upload image as asset, using string URL fallback:`, err.message);
    }

    const doc = {
      _type: 'project',
      _id: `project-${proj.id}`,
      title: proj.title,
      description: proj.description,
      tags: proj.tags,
      category: proj.category,
      date: proj.date,
      duration: proj.duration,
      features: proj.features,
      githubUrl: proj.githubUrl,
      projectUrl: proj.projectUrl,
      isLive: proj.isLive,
      type: proj.type,
      image: imageValue,
    };

    console.log(`Creating/updating document ${doc._id} in Sanity...`);
    await client.createOrReplace(doc);
    console.log(`Document ${doc._id} published successfully!`);
  }
  
  console.log('\nAll projects processed and uploaded successfully!');
}

upload().catch(console.error);
