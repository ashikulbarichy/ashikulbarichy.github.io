import { useState } from 'react';
import { Briefcase, MapPin, ExternalLink } from 'lucide-react';

const experiences = [
  {
    company: 'NSU',
    role: 'Quantum ML Research',
    location: 'Dhaka',
    website: '',
    period: '2025 – Present',
    description: 'Conducting research on quantum machine learning and quantum computing. I started learning about quantum computing and quantum machine learning. Primarily working on Quantum Neural Network models and their applications on medical domain. ',
    tags: ['Python', 'Quantum ML'],
    logo: '',
  },
  {
    company: 'NSU',
    role: 'AI Powered SaaS Application Project',
    location: 'Dhaka',
    website: '',
    period: '2025 - Present',
    description: 'Started diving deeper into AI and ML. I started learning about LLMs and other AI related technologies. I started learning about SaaS applications and how to build them. As a part of the capstone project, I collaborated with my teammates and succesfully built the application. In this stage of my development journey, I started learning and using git and version control. Currently the application is on testing phase and will be deployed soon.',
    tags: ['ASP.NET', 'React', 'SQLite','Gemini','Github'],
    logo: '',
  },
  {
    company: 'North South University',
    role: 'CS Undergraduate',
    location: 'Dhaka',
    website: '',
    period: '2025 - Present',
    description: 'Having little experience in C programming language, I started learning C++ during my second semester. On later semesters, I started learning OOP using Java, DSA and SQL using PHP, which were part of curriculum.',
    tags: ['Java', 'PHP', 'SQL', 'C++'],
    logo: '',
  },
  {
    company: 'NSU',
    role: 'Junior Capstone Project',
    location: 'Dhaka',
    website: '',
    period: '2023',
    description: 'As a part of my junior capstone project, I started learning ASP.NET Core and PostgreSQL. I also started learning React and Node.js during this time. I built a mental health application using ASP.NET Core, React and PostgreSQL.',
    tags: ['.NET', 'React', 'PostgreSQL'],
    logo: '',
  },
  {
    company: 'Home',
    role: 'Starting Scratch',
    location: 'Remote',
    website: '',
    period: '2018',
    description: 'Diving early into the world of computer made me interested in technology and thus I started learning HTML, CSS during my high school days. Got introduced to C programming language in my high school days as a part of curriculum',
    tags: ['HTML', 'Css', 'C'],
    logo: '',
  },
];

const tagColors: Record<string, string> = {
  Javascript: 'bg-[#4338ca] text-white',
  PHP: 'bg-[#3730a3] text-white',
  HTML: 'bg-[#312e81] text-white',
  CSS: 'bg-[#1e293b] text-white',
  Figma: 'bg-[#334155] text-white',
};

const Journey = () => {
  const [openIndex, setOpenIndex] = useState(-1);

  return (
    <section id="journey" className="content-spacing section-container">
      <div className="container-width section-padding">
        <div className="text-center mb-4 sm:mb-6">
          <div className="flex items-center justify-center space-x-2 mb-2 sm:mb-5">
            <div className="w-8 md:w-12 h-0.5 bg-gradient-to-r from-purple-500 to-fuchsia-500" />
            <div className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5 md:h-6 md:w-6 text-purple-400 animate-pulse" />
              <span className="text-purple-400 font-medium text-xs sm:text-sm md:text-lg">My Journey</span>
            </div>
            <div className="w-8 md:w-12 h-0.5 bg-gradient-to-r from-fuchsia-500 to-purple-500" />
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold heading-gradient text-center mb-2 sm:mb-3">Volunteering, Learning & Growth</h2>
        <div className="flex flex-col mt-6 w-[70%] max-w-xl mx-auto">
          {experiences.map((exp, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={exp.company}>
                <div
                  className={`rounded-lg transition-all duration-300 overflow-hidden mb-3 border-2 bg-[#231942] ${isOpen ? 'border-fuchsia-400/70' : 'border-purple-300/40'} shadow-md`}
                >
                  <button
                    className={`w-full flex items-center justify-between gap-2 px-4 py-2 sm:py-3 text-left focus:outline-none font-semibold text-base sm:text-lg tracking-tight transition-all duration-200
                      ${isOpen ? 'bg-[#231942] text-white border-fuchsia-500' : 'bg-[#1a1333] text-slate-200 hover:bg-[#312e81]'}
                      rounded-lg`}
                    onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                    aria-expanded={isOpen}
                    style={{
                      borderBottom: isOpen ? '1px solid #a78bfa' : undefined,
                    }}
                  >
                    <span className="font-semibold flex-1 truncate text-left text-slate-100 text-base sm:text-lg">{exp.role} <span className="text-fuchsia-400 font-bold">@ {exp.company}</span></span>
                    <span className="font-medium text-xs sm:text-sm text-slate-400 ml-2 flex-shrink-0 text-right min-w-[90px]">{exp.period}</span>
                    <span className="ml-3 text-xl font-bold flex-shrink-0 text-fuchsia-400">{isOpen ? '–' : '+'}</span>
                  </button>
                </div>
                {/* Details as a separate card with margin above and below, with smoother closing animation */}
                <div
                  className={`transition-all duration-700 ease-in-out ${isOpen ? 'max-h-[350px] opacity-100 mt-3 mb-3' : 'max-h-0 opacity-0 m-0'} overflow-hidden`}
                  style={{
                    willChange: 'max-height, opacity',
                  }}
                >
                  <div className={`p-4 sm:p-5 bg-[#2d2154] border-2 border-fuchsia-400/70 rounded-lg flex flex-col sm:flex-row gap-4 items-start animate-fade-in ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4 text-fuchsia-400" />
                        <span className="text-xs text-slate-400 font-medium mr-2">{exp.location}</span>
                        {exp.website && (
                          <>
                            <ExternalLink className="h-4 w-4 text-fuchsia-400 ml-2" />
                            <a href={exp.website} target="_blank" rel="noopener noreferrer" className="text-xs text-fuchsia-300 underline hover:text-fuchsia-400 ml-1">{exp.website.replace('https://', '').replace('http://', '')}</a>
                          </>
                        )}
                      </div>
                      <div className="text-slate-300 text-sm sm:text-base mb-2 font-normal">
                        {exp.description}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {exp.tags.map(tag => (
                          <span key={tag} className={`px-3 py-0.5 rounded-full text-xs font-sans font-medium shadow-sm ${tagColors[tag] || 'bg-[#312e81] text-white'}`}>{tag}</span>
                        ))}
                      </div>
                    </div>
                    {exp.logo && (
                      <div className="flex flex-col items-center justify-center min-w-[70px]">
                        <img src={exp.logo} alt={exp.company + ' logo'} className="h-8 w-auto object-contain mb-1" />
                        <span className="text-xs text-slate-300 font-semibold">{exp.company}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Journey;