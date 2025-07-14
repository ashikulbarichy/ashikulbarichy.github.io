import { Monitor, Wrench, ClipboardList, BadgeCheck, CheckCircle } from 'lucide-react';

const skills = [
  {
    icon: <Monitor className="h-7 w-7 text-white mb-4 group-hover:text-purple-800 transition-colors duration-300" />, // Development icon
    title: (
      <>
        <span className="font-bold text-xl sm:text-2xl text-white">Development <span className="relative inline-block"><span className="z-10 relative">Skills</span><span className="absolute left-0 right-0 bottom-0 h-1 bg-pink-500 rounded-full -z-10 transition-all duration-300 opacity-0 scale-x-75 group-hover:opacity-100 group-hover:scale-x-100" style={{height:'0.25em'}} /></span></span>
      </>
    ),
    points: [
      'ASP.NET, C#',
      'Python',
      'React',
      'Relational Databases',
    ],
    border: 'border-pink-400/30',
  },
  {
    icon: <Wrench className="h-7 w-7 text-white mb-4 group-hover:text-purple-800 transition-colors duration-300" />, // Tools icon
    title: (
      <>
        <span className="font-bold text-xl sm:text-2xl text-white">Tools <span className="relative inline-block"><span className="z-10 relative">& Technologies</span><span className="absolute left-0 right-0 bottom-0 h-1 bg-blue-400 rounded-full -z-10 transition-all duration-300 opacity-0 scale-x-75 group-hover:opacity-100 group-hover:scale-x-100" style={{height:'0.25em'}} /></span></span>
      </>
    ),
    points: [
      'Git, GitHub, Docker',
      'Azure, Cloud Platform',
      'Jira, ClickUp',
      'Figma, Notion, Slack',
      'PostgreSQL, SQLite',
    ],
    border: 'border-blue-400/30',
  },
  {
    icon: <ClipboardList className="h-7 w-7 text-white mb-4 group-hover:text-purple-800 transition-colors duration-300" />, // Project Management icon
    title: (
      <>
        <span className="font-bold text-xl sm:text-2xl text-white">Project <span className="relative inline-block"><span className="z-10 relative">Management</span><span className="absolute left-0 right-0 bottom-0 h-1 bg-purple-400 rounded-full -z-10 transition-all duration-300 opacity-0 scale-x-75 group-hover:opacity-100 group-hover:scale-x-100" style={{height:'0.25em'}} /></span></span>
      </>
    ),
    points: [
      'Team leadership',
      'Agile/Scrum',
      'Stakeholder Communication',
      'Strategic Planning & Documentation',
      'Budget Management'
    ],
    border: 'border-purple-400/30',
  },
];

const Skills = () => {
  return (
    <section id="skills" className="content-spacing section-container">
      <div className="container-width section-padding">
        {/* Section Title Like Other Sections */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="flex items-center justify-center space-x-2 mb-4 sm:mb-5">
            <div className="w-8 md:w-12 h-0.5 bg-gradient-to-r from-purple-500 to-fuchsia-500" />
            <div className="flex items-center space-x-2">
              <BadgeCheck className="h-5 w-5 md:h-6 md:w-6 text-purple-400 animate-pulse" />
              <span className="text-purple-400 font-medium text-sm md:text-lg">My Skills</span>
            </div>
            <div className="w-8 md:w-12 h-0.5 bg-gradient-to-r from-fuchsia-500 to-purple-500" />
          </div>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold heading-gradient text-center mb-3 sm:mb-4">Core Competencies</h2>
        <p className="text-center text-gray-400 text-sm sm:text-base max-w-2xl mx-auto mb-12 sm:mb-14">A blend of software development and project management—enabling me to build robust, user-centric, and scalable solutions for any challenge.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {skills.map((skill, idx) => (
            <div
              key={idx}
              className={`glass-effect border-neutral rounded-2xl p-7 flex flex-col items-start shadow-xl transition-all duration-300 hover:scale-[1.025] min-h-[260px] group`}
            >
              {skill.icon}
              <div className="mb-3 relative w-full">
                {skill.title}
              </div>
              <ul className="w-full space-y-2 mt-2">
                {skill.points.map((point, i) => (
                  <li key={i} className="flex items-center text-sm sm:text-base text-body font-sans font-medium">
                    <CheckCircle className="h-4 w-4 text-purple-400 mr-2 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;