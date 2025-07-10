import { Link } from 'react-router-dom'
import { Code2, Github, Linkedin, Twitter, Mail } from 'lucide-react'

const Footer = () => {
  const socialLinks = [
    {
      icon: Github,
      href: 'https://github.com/ashikulbari',
      label: 'GitHub',
      color: 'hover:text-gray-300'
    },
    {
      icon: Linkedin,
      href: 'https://linkedin.com/in/ashikulbari',
      label: 'LinkedIn',
      color: 'hover:text-blue-400'
    },
    {
      icon: Twitter,
      href: 'https://twitter.com/ashikulbari',
      label: 'Twitter',
      color: 'hover:text-sky-400'
    },
    {
      icon: Mail,
      href: 'mailto:ashikul.chowdhury@proton.me',
      label: 'Email',
      color: 'hover:text-green-400'
    }
  ]

  return (
    <footer className="bg-black/20 border-t border-white/10">
      <div className="container-width section-padding py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Code2 className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-bold heading-gradient">Ashikul Bari Chowdhury</span>
            </div>
            <p className="text-gray-400 max-w-md">
              Full-stack developer and project manager passionate about creating 
              exceptional digital experiences and leading high-performing teams.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/projects" className="text-gray-400 hover:text-primary transition-colors">
                  Projects
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Follow Me</h3>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 ${social.color} transition-all duration-300 hover:scale-110 hover:bg-white/10`}
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Let's Connect</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:ashikul.chowdhury@proton.me"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  ashikul.chowdhury@proton.me
                </a>
              </li>
              <li>
                <span className="text-gray-400">Dhaka, Bangladesh</span>
              </li>
              <li>
                <span className="text-gray-400">Available for new opportunities</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} Ashikul Bari Chowdhury. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer