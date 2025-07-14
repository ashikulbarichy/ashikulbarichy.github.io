import { Mail, MessageSquare, Send } from 'lucide-react'

const ContactMe = () => {
  const handleGetInTouch = () => {
    window.open('mailto:ashikul.chowdhury@proton.me', '_blank')
  }

  return (
    <section id="contact" className="content-spacing section-container bg-black/30 backdrop-blur-md">
      <div className="container-width section-padding">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-6 sm:space-y-8 md:space-y-10">
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              <div className="flex items-center justify-center space-x-2 md:space-x-3">
                <div className="w-6 sm:w-8 md:w-16 h-0.5 bg-gradient-to-r from-purple-500 to-fuchsia-500" />
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-purple-400 animate-pulse" />
                  <span className="text-purple-300 font-semibold text-sm md:text-lg">Get In Touch</span>
                </div>
                <div className="w-6 sm:w-8 md:w-16 h-0.5 bg-gradient-to-r from-purple-500 to-fuchsia-500" />
              </div>
              
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold heading-gradient leading-tight">
                Let's Work Together
              </h2>
              
              <p className="text-sm sm:text-base md:text-xl text-body leading-relaxed max-w-3xl mx-auto px-4">
                I'm open to discussing new opportunities 
                or just having a chat about technology and development. Feel free to reach out!
              </p>
            </div>

            <div className="pt-3 sm:pt-4 md:pt-6">
              <button 
                onClick={handleGetInTouch}
                className="inline-flex items-center space-x-2 text-center group px-6 py-3 md:px-8 md:py-4 border-2 border-pink-500 bg-pink-500 text-white rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:bg-black/80 hover:text-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 focus:ring-offset-black"
                aria-label="Send email to Ashikul Bari Chowdhury"
              >
                <Mail className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 group-hover:scale-110 transition-transform duration-300" />
                <span className="transition-colors duration-300">Get In Touch</span>
                <Send className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>

            <div className="pt-6 sm:pt-8 md:pt-12">
              <div className="glass-effect p-4 sm:p-6 md:p-8 rounded-2xl max-w-2xl mx-auto">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4 sm:mb-6">Embark on my professional journey</h3>
                <p className="text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed mb-4 sm:mb-6">
                  Whether you need a backend developer or project manager, 
                  I'm here to help bring ideas to life. My vision is to learn and grow with the team. Let's discuss how we can work together 
                  to achieve business goals with continous learning.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <div className="flex items-center space-x-2 text-purple-300">
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">ashikul.chowdhury@proton.me</span>
                  </div>
                  {/* Response time on next line for all screen sizes */}
                </div>
                <div className="w-full flex justify-center">
                  <span className="block text-xs sm:text-sm text-gray-400 mt-2 text-center">Expected response time: <span className="text-fuchsia-400 font-medium">within 24 hours</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactMe 