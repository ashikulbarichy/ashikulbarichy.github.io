import { User } from 'lucide-react';

const About = () => {
  // Remove hero section, keep only two-column layout
  return (
    <section id="about" className="content-spacing trusted-gradient section-container">
      {/* Two Column Layout (from About) */}
      <div className="container-width section-padding">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="flex items-center justify-center space-x-2 md:space-x-3 mb-2 sm:mb-4">
            <div className="w-6 sm:w-8 md:w-16 h-0.5 bg-gradient-to-r from-purple-500 to-fuchsia-500" />
            <div className="flex items-center space-x-2">
              <User className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-purple-400 animate-pulse" />
              <span className="text-purple-300 font-semibold text-xs sm:text-sm md:text-lg">About Me</span>
            </div>
            <div className="w-6 sm:w-8 md:w-16 h-0.5 bg-gradient-to-r from-purple-500 to-fuchsia-500" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold heading-gradient leading-tight">
            Crafting Digital & Unique Solutions
          </h2>
        </div>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
            {/* Left Column - Description */}
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-3 sm:space-y-6">
                <p className="text-xs sm:text-base md:text-lg text-body leading-relaxed">
                  I passionately work in creating robust web applications using ASP.NET Core and PostgreSQL. 
                  My approach combines strategic thinking, secured approach and agile methodologies containing
                  business needs and team values.
                </p>
                <p className="text-xs sm:text-base md:text-lg text-body leading-relaxed">
                  Based in Dhaka, Bangladesh, I am looking for oppurtunities both remote and on-site to deliver technical solutions that drive 
                  business success.
                </p>
              </div>
              {/* Key Highlights */}
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div className="glass-effect p-4 rounded-xl text-center hover-lift">
                  <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">1+</div>
                  <div className="text-xs sm:text-sm text-slate-300">Year of Coding</div>
                </div>
                <div className="glass-effect p-4 rounded-xl text-center hover-lift">
                  <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">3</div>
                  <div className="text-xs sm:text-sm text-slate-300">Projects Completed</div>
                </div>
                <div className="glass-effect p-4 rounded-xl text-center hover-lift">
                  <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">1</div>
                  <div className="text-xs sm:text-sm text-slate-300">Research Ongoing</div>
                </div>
                <div className="glass-effect p-4 rounded-xl text-center hover-lift">
                  <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">50+</div>
                  <div className="text-xs sm:text-sm text-slate-300">Github Commits</div>
                </div>
              </div>
            </div>
            {/* Right Column - Interactive Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative group">
                {/* Interactive Background Glow */}
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 to-fuchsia-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110"></div>
                {/* Main Image Container */}
                <div className="relative glass-effect p-2 rounded-2xl hover-lift transition-all duration-300 group-hover:scale-105">
                  <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-xl overflow-hidden relative">
                    {/* Placeholder for your image - replace src with your actual image */}
                    <img 
                      src="https://www.dropbox.com/scl/fi/217kcnp8jq5q6z7yxc9bf/pro_pic.png?rlkey=fp0rg36ds9ojrozll3zdy25uv&st=by85hrsj&dl=1" 
                      alt="Ashikul Bari Chowdhury - Full Stack Developer & Project Manager"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Overlay with interactive elements */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {/* Floating elements for interactivity */}
                    <div className="absolute top-4 right-4 w-3 h-3 bg-primary rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute bottom-4 left-4 w-2 h-2 bg-fuchsia-400 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ animationDelay: '0.5s' }}></div>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-purple-400 to-fuchsia-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-150"></div>
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-gradient-to-r from-fuchsia-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-150" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;