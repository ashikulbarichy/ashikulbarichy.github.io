import { useState, useEffect } from 'react';
import { Code, Layers } from 'lucide-react';

const ProjectsHero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { icon: Code, value: '3', label: 'Projects Completed' },
    { icon: Layers, value: '10', label: 'Technologies Used' }
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
              <span className="text-primary font-medium">My Portfolio</span>
              <div className="w-12 h-0.5 bg-primary" />
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="heading-gradient">Creative Solutions.</span>
              <br />
              <span className="text-white">Exceptional Results.</span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              From concept to deployment, explore a collection of projects that showcase 
              my expertise in web application development, project management, and creative 
              problem-solving across various industries and technologies.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto pt-12">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="glass-effect p-8 rounded-2xl text-center hover-lift">
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

export default ProjectsHero;