import { useState, useEffect } from 'react';
import { Users, Calendar, Coffee, BrainCircuit } from 'lucide-react';

const AboutHero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { icon: Calendar, value: '1+', label: 'Year Coding' },
    { icon: Users, value: '3', label: 'Team Projects' },
    { icon: BrainCircuit, value: '1', label: 'Research Ongoing' },
    { icon: Coffee, value: '50+', label: 'GitHub Commits' }
  ];

  return (
    <section className="pt-24 pb-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <div className="container-width section-padding">
        <div className={`text-center space-y-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="space-y-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-12 h-0.5 bg-primary" />
              <span className="text-primary font-medium">About Me</span>
              <div className="w-12 h-0.5 bg-primary" />
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="heading-gradient">Developer.</span>
              <br />
              <span className="text-white">Technical Strategist.</span>
              <br />
              <span className="text-primary">Solution Architect.</span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            I'm Ashikul Bari, an aspiring ASP.NET developer and project manager with a passion for 
            combining technology and teamwork. I'm eager to contribute to impactful digital solutions 
            while learning to lead and grow with dynamic teams.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto pt-12">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="glass-effect p-6 rounded-2xl text-center hover-lift">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;