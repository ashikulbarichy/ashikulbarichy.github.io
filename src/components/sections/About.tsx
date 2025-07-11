const About = () => {
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
                As a recent graduate with hands-on experience in ASP.NET projects, I’m passionate about building enterprise-grade, scalable solutions with 
                business goals. With a growing interest in project management, I aim to bridge the gap between technology and 
                teamwork—driving results through both code and collaboration.
              </p>
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