import { useState } from 'react';
import { 
  Users, 
  Target, 
  MessageSquare, 
  GitBranch, 
  Container, 
  Cloud, 
  Trello, 
  Figma, 
  Slack,
  Zap,
  Shield,
  DollarSign,
  Code2,
  NotebookPen,
  File,
  Database
} from 'lucide-react';

// Import brand icons from react-icons
import { 
  SiDotnet, 
  SiReact, 
  SiPython, 
  SiPostgresql,
} from 'react-icons/si';

const Skills = () => {
  const [activeCategory, setActiveCategory] = useState('development');

  const skillCategories = {
    development: {
      title: 'Development',
      skills: [
        { 
          name: 'ASP.NET', 
          icon: SiDotnet,
          description: 'Enterprise web applications',
          color: 'from-purple-500 to-blue-500'
        },
        { 
          name: 'React', 
          icon: SiReact,
          description: 'Dynamic web interfaces',
          color: 'from-blue-500 to-cyan-500'
        },
        { 
          name: 'Python', 
          icon: SiPython,
          description: 'Backend development & automation',
          color: 'from-yellow-500 to-green-500'
        },
        { 
          name: 'PostgreSQL', 
          icon: SiPostgresql,
          description: 'Relational database management',
          color: 'from-blue-500 to-indigo-500'
        },
        { 
          name: 'Entity Framework Core', 
          icon: Database,
          description: 'ORM for .NET applications',
          color: 'from-purple-600 to-blue-600'
        }
      ]
    },
    management: {
      title: 'Project Management',
      skills: [
        { 
          name: 'Agile/Scrum', 
          icon: Zap,
          description: 'Iterative project delivery',
          color: 'from-orange-500 to-red-500'
        },
        { 
          name: 'Team Leadership', 
          icon: Users,
          description: 'Cross-functional team management',
          color: 'from-blue-500 to-purple-500'
        },
        { 
          name: 'Strategic Planning', 
          icon: Target,
          description: 'Long-term project roadmaps',
          color: 'from-indigo-500 to-blue-500'
        },
        { 
          name: 'Risk Management', 
          icon: Shield,
          description: 'Project risk assessment',
          color: 'from-yellow-500 to-orange-500'
        },
        { 
          name: 'Stakeholder Communication', 
          icon: MessageSquare,
          description: 'Client & team coordination',
          color: 'from-green-500 to-blue-500'
        },
        { 
          name: 'Budget Management', 
          icon: DollarSign,
          description: 'Resource allocation & cost control',
          color: 'from-purple-500 to-pink-500'
        },
        { 
          name: 'Project Documentation', 
          icon: File,
          description: 'Project documentation & reporting',
          color: 'from-green-500 to-emerald-500'
        }
      ]
    },
    tools: {
      title: 'Tools & Technologies',
      skills: [
        { 
          name: 'Git/GitHub', 
          icon: GitBranch,
          description: 'Version control & collaboration',
          color: 'from-gray-600 to-gray-800'
        },
        { 
          name: 'Docker', 
          icon: Container,
          description: 'Containerization & deployment',
          color: 'from-blue-500 to-cyan-500'
        },
        { 
          name: 'Azure/Cloud', 
          icon: Cloud,
          description: 'Cloud infrastructure & services',
          color: 'from-orange-500 to-yellow-500'
        },
        { 
          name: 'Jira/Clickup', 
          icon: Trello,
          description: 'Project tracking & management',
          color: 'from-blue-600 to-indigo-600'
        },
        { 
          name: 'Figma', 
          icon: Figma,
          description: 'UI/UX design & prototyping',
          color: 'from-purple-500 to-pink-500'
        },
        { 
          name: 'Slack/Teams', 
          icon: Slack,
          description: 'Team communication & collaboration',
          color: 'from-green-500 to-teal-500'
        },
        { 
          name: 'Notion', 
          icon: NotebookPen,
          description: 'Documentation & Planning',
          color: 'from-green-500 to-teal-500'
        }
      ]
    }
  };

  

  return (
    <section id="skills" className="content-spacing section-container">
      <div className="container-width section-padding">
        <div className="text-center mb-12 md:mb-16">
          <div className="flex items-center justify-center space-x-2 md:space-x-3 mb-4 md:mb-6">
            <div className="w-8 md:w-12 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <span className="text-blue-300 font-medium text-sm md:text-base">My Skills</span>
            <div className="w-8 md:w-12 h-0.5 bg-gradient-to-r from-indigo-500 to-blue-500" />
          </div>
          <h2 className="text-section-title font-bold heading-gradient mb-4 md:mb-6">
            Expertise & Capabilities
          </h2>
          <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto">
            A comprehensive skill set spanning <strong>backend development</strong> and <strong>project management</strong>, 
            honed through multiple projects with <strong>React</strong>, <strong>ASP.NET</strong>, 
            <strong>Python</strong>, and continuous learning.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center mb-8 md:mb-12">
          <div className="glass-effect p-1 md:p-2 rounded-full w-full max-w-2xl">
            <div className="grid grid-cols-3 gap-1 md:gap-2">
              {Object.entries(skillCategories).map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`px-3 py-2 md:px-6 md:py-3 rounded-full font-medium transition-all duration-300 text-xs md:text-sm ${
                    activeCategory === key
                      ? 'bg-primary text-primary-foreground'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  aria-label={`View ${category.title} skills`}
                >
                  {category.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Skills Display with Real Brand Icons */}
        <div className="skills-grid">
          {skillCategories[activeCategory as keyof typeof skillCategories].skills.map((skill, index) => {
            const Icon = skill.icon;
            return (
              <article 
                key={index} 
                className="skills-card card-trusted rounded-xl hover-lift group transition-all duration-300"
              >
                <div className="skills-card-content">
                  {/* Icon Container with Real Brand Icons */}
                  <div className="flex justify-center">
                    <div className={`skills-icon-container bg-gradient-to-br ${skill.color} bg-opacity-20 border border-white/10 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="skills-icon text-white group-hover:text-blue-100 transition-colors" />
                    </div>
                  </div>
                  
                  {/* Skill Name */}
                  <h3 className="skills-title font-bold text-white group-hover:text-blue-100 transition-colors">
                    {skill.name}
                  </h3>
                  
                  {/* Description */}
                  <p className="skills-description text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed flex-grow">
                    {skill.description}
                  </p>
                  
                  {/* Decorative Element */}
                  <div className="flex justify-center mt-auto pt-2">
                    <div className={`skills-divider rounded-full bg-gradient-to-r ${skill.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Skills;