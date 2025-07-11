import { Heart, Code, Lightbulb, Rocket, Star, Zap } from 'lucide-react';

const PassionStory = () => {
  const passionMilestones = [
    {
      icon: Heart,
      title: 'The Spark',
      year: '2019-2020',
      story: 'My journey began with learning basic C programming during my high school days my first "Hello World" and feeling the interest of making a computer respond to my code. The interest grew during my first semester of university.',
      emotion: 'Curiosity',
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: Code,
      title: 'The Learning Curve',
      year: '2021',
      story: 'During my second year of university, I got introduced to object oriented programming and data structure and algorithms. Initially, it was challenging but I started to understand the theories and importance of it.',
      emotion: 'Perseverance',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: Lightbulb,
      title: 'The First Project',
      year: '2024',
      story: 'Building my first real app was both challenging and rewarding. I was working on my junior capstone project and worked on a web application using ASP.NET Core and PostgreSQL Server.',
      emotion: 'Pride',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Rocket,
      title: 'The Collaboration',
      year: '2025',
      story: 'It was in my senior capstone course. I was Working with advanced project with my groupmates in university taught me the value of communication and teamwork in software development.',
      emotion: 'Growth',
      color: 'from-green-500 to-teal-500'
    },
    {
      icon: Star,
      title: 'The Recognition',
      year: '2025',
      story: 'Receiving positive feedback from supervisor and peers motivated me to keep learning and improving.',
      emotion: 'Encouragement',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Zap,
      title: 'The Aspiration',
      year: '2025',
      story: 'As I look ahead, I am eager to take on new challenges, contribute to real-world projects, and grow as a developer, a person and a leader.',
      emotion: 'Ambition',
      color: 'from-indigo-500 to-blue-500'
    }
  ];

  return (
    <section className="py-20 bg-black/20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-600/30 to-indigo-600/30 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container-width section-padding">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500" />
            <Heart className="h-6 w-6 text-pink-400 animate-pulse" />
            <span className="text-pink-300 font-medium">My Passion Story</span>
            <div className="w-12 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold heading-gradient mb-6">
            The Journey of a Thousand Lines
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Every person starts somewhere. My journey is about embracing challenges, learning from mistakes, and celebrating every small wins. I believe that with passion and perseverance, even the smallest steps can lead to big achievements.
          </p>
        </div>

        {/* Passion Timeline */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {passionMilestones.map((milestone, index) => {
              const Icon = milestone.icon;
              return (
                <div 
                  key={index} 
                  className="relative group"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  {/* Connection Line for larger screens */}
                  {index < passionMilestones.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-8 h-0.5 bg-gradient-to-r from-white/20 to-transparent z-0" />
                  )}
                  
                  <div className="glass-effect p-6 rounded-2xl hover-lift relative z-10 h-full flex flex-col">
                    {/* Icon and Year */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${milestone.color} bg-opacity-20 border border-white/10 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{milestone.year}</div>
                        <div className={`text-xs font-medium bg-gradient-to-r ${milestone.color} bg-clip-text text-transparent`}>
                          {milestone.emotion}
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-100 transition-colors">
                      {milestone.title}
                    </h3>

                    {/* Story */}
                    <p className="text-gray-400 leading-relaxed text-sm group-hover:text-gray-300 transition-colors">
                      {milestone.story}
                    </p>

                    {/* Decorative Element */}
                    <div className="mt-8 flex justify-center">
                      <div className={`w-16 h-0.5 rounded-full bg-gradient-to-r ${milestone.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Passion Statement */}
        <div className="mt-16 text-center">
          <div className="glass-effect p-8 rounded-3xl max-w-4xl mx-auto relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500" />
            </div>
            
            <div className="relative z-10 space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl border border-pink-400/30">
                  <Heart className="h-8 w-8 text-pink-400" />
                </div>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Why I Code
              </h3>
              
              <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto">
                "For me, coding is about curiosity and growth. Each project is a new opportunity to learn, solve problems, and make a difference. As a fresher, I am excited to keep exploring, building, and contributing to the world of technology."
              </p>
              
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                <span className="px-4 py-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 text-sm rounded-full border border-pink-400/30">
                  💝 Passion-Driven
                </span>
                <span className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-300 text-sm rounded-full border border-blue-400/30">
                  🚀 BusinessOriented
                </span>
                <span className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-teal-500/20 text-green-300 text-sm rounded-full border border-green-400/30">
                  🤝 People-Centered
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PassionStory;