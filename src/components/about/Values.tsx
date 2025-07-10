import { Heart, Target, Lightbulb, Users, Zap, Shield } from 'lucide-react';

const Values = () => {
  const values = [
    {
      icon: Heart,
      title: 'Passion-Driven',
      description: 'I believe that genuine passion for technology and problem-solving is the foundation of exceptional work.'
    },
    {
      icon: Target,
      title: 'Results-Focused',
      description: 'Every project I undertake is driven by clear objectives and measurable outcomes that deliver real value.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation First',
      description: 'I constantly seek creative solutions and embrace new technologies to stay ahead of the curve.'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Great products are built by great teams. I foster collaborative environments where everyone can thrive.'
    },
    {
      icon: Zap,
      title: 'Continuous Learning',
      description: 'Technology evolves rapidly, and I\'m committed to continuous learning and professional growth.'
    },
    {
      icon: Shield,
      title: 'Quality & Reliability',
      description: 'I never compromise on code quality, testing, and reliability. Every solution is built to last.'
    }
  ];

  return (
    <section className="py-20">
      <div className="container-width section-padding">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-0.5 bg-primary" />
            <span className="text-primary font-medium">My Values</span>
            <div className="w-12 h-0.5 bg-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold heading-gradient mb-6">
            What Drives Me
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            These core values guide every decision I make and every project I undertake. 
            They're not just principles - they're the foundation of how I work and lead.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div key={index} className="glass-effect p-8 rounded-2xl hover-lift text-center">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-primary/10 rounded-2xl">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{value.title}</h3>
                <p className="text-gray-400 leading-relaxed">{value.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="glass-effect p-8 rounded-2xl max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">My Philosophy</h3>
            <p className="text-lg text-gray-300 leading-relaxed">
              "Technology should serve people, not the other way around. My goal is to create 
              solutions that are not only technically excellent but also genuinely useful and 
              accessible to everyone. Great software is built by great teams, and great teams 
              are built on trust, communication, and shared vision."
            </p>
            <div className="mt-6">
              <span className="text-primary font-semibold">— Alex Johnson</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Values;