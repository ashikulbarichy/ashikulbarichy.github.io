import { CheckCircle } from 'lucide-react';

const About = () => {
  const achievements = [
    'Led development teams of 8+ developers',
    'Delivered 50+ successful projects',
    'Improved team productivity by 40%',
    'Expert in Agile methodologies'
  ];

  return (
    <section id="about" className="content-spacing trusted-gradient section-container">
      <div className="container-width section-padding">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-8 md:space-y-10">
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center justify-center space-x-2 md:space-x-3">
                <div className="w-8 md:w-16 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
                <span className="text-blue-300 font-semibold text-sm md:text-lg">About Me</span>
                <div className="w-8 md:w-16 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
              </div>
              
              <h2 className="text-section-title font-bold heading-gradient leading-tight">
                Crafting Digital Excellence Through Code & Leadership
              </h2>
              
              <p className="text-base md:text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto">
                With over <strong>5 years of experience</strong> in software development and project management, 
                I bridge the gap between technical innovation and business objectives. My passion 
                lies in creating scalable solutions using <strong>React</strong>, <strong>Angular</strong>, <strong>ASP.NET</strong>, 
                and <strong>Python</strong> while fostering collaborative team environments 
                that drive exceptional results.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-2xl mx-auto">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center space-x-3 md:space-x-4 group">
                  <div className="p-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                  <span className="text-sm md:text-base text-slate-200 font-medium group-hover:text-white transition-colors duration-300">{achievement}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 md:pt-6">
              <a 
                href="/about"
                className="btn-primary btn-interactive inline-block text-center"
                aria-label="Learn more about Ashikul Bari Chowdhury's experience and background"
              >
                <span>Learn More About Me</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;