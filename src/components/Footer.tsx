import { Link } from 'react-router-dom'
import { Code2, Mail, MapPin, Phone, Github, Linkedin, Twitter, Rss } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black/20 border-t border-white/10">
      <div className="container-width section-padding py-6 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 sm:gap-8 lg:gap-x-16 items-start">
          {/* Brand */}
          <div className="sm:col-span-1 lg:col-span-1 flex flex-col items-start lg:pr-8 lg:border-r lg:border-white/10">
            <div className="flex items-center space-x-2 mb-3 sm:mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Code2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <span className="text-lg sm:text-xl font-bold heading-gradient text-white">Ashikul Bari Chowdhury</span>
            </div>
            <p className="text-sm sm:text-base text-white max-w-md leading-relaxed">
              ASP.NET developer and project manager passionate about creating 
              exceptional technical products and leading high-performing teams.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-start">
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-white hover:text-pink-400 transition-colors text-sm sm:text-base">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/projects"
                  className="text-white hover:text-pink-400 transition-colors text-sm sm:text-base"
                  onClick={() => {
                    // Let navigation happen, then scroll to top
                    setTimeout(() => {
                      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                    }, 0);
                  }}
                >
                  Projects
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col items-start">
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-white">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm sm:text-base">ashikul.chowdhury@proton.me</span>
              </li>
              <li className="flex items-center space-x-2 text-white">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm sm:text-base">Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center space-x-2 text-white">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-sm sm:text-base">+880-170-6543773</span>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="flex flex-col items-start w-full">
            <h3 className="text-white font-semibold text-sm sm:text-base mb-2">Connect</h3>
            <div className="flex flex-row items-center space-x-3 pt-1 pb-2">
              <a
                href="https://github.com/ashikulbarichy"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5 text-white group-hover:text-pink-400 transition-colors" />
              </a>
              <a
                href="https://linkedin.com/in/ashikulbarichy"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5 text-white group-hover:text-blue-400 transition-colors" />
              </a>
              <a
                href="https://twitter.com/brownkid_sami"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5 text-white group-hover:text-sky-400 transition-colors" />
              </a>
              <a
                href="mailto:ashikul.chowdhury@proton.me"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                aria-label="Email"
              >
                <Mail className="h-5 w-5 text-white group-hover:text-green-400 transition-colors" />
              </a>
              <a
                href="https://ashikulbarichowdhury.medium.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                aria-label="Blog"
              >
                <Rss className="h-5 w-5 text-white group-hover:text-orange-400 transition-colors" />
              </a>
            </div>
          </div>

        {/* Copyright */}
        <div className="border-t border-white/10 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
          <p className="text-sm text-white">
            © {currentYear} Ashikul Bari Chowdhury. All rights reserved.
          </p>
        </div>
      </div>
      </div>
    </footer>
  )
}

export default Footer