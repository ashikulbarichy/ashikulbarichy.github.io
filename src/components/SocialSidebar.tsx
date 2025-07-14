import { Github, Linkedin, Twitter, Mail, Rss } from 'lucide-react'

const SocialSidebar = () => {
  const socialLinks = [
    {
      icon: Github,
      href: 'https://github.com/ashikulbarichy',
      label: 'GitHub',
      color: 'hover:text-gray-300'
    },
    {
      icon: Linkedin,
      href: 'https://linkedin.com/ashikulbarichy',
      label: 'LinkedIn',
      color: 'hover:text-blue-400'
    },
    {
      icon: Twitter,
      href: 'https://twitter.com/brownkid_sami',
      label: 'Twitter',
      color: 'hover:text-sky-400'
    },
    {
      icon: Mail,
      href: 'mailto:ashikul.chowdhury@proton.me',
      label: 'Email',
      color: 'hover:text-green-400'
    },
    {
      icon: Rss,
      href: 'https://ashikulbarichowdhury.medium.com/',
      label: 'Blog',
      color: 'hover:text-green-400'
    } 
    
  ]

  return (
    <div className="social-sidebar">
      <div className="flex flex-col space-y-3 card-trusted p-3 rounded-2xl backdrop-blur-sm shadow-lg">
        {socialLinks.map((social, index) => {
          const Icon = social.icon
          return (
            <a
              key={index}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2.5 rounded-xl bg-slate-800/50 border border-purple-400/20 text-gray-400 ${social.color} transition-all duration-300 hover:scale-110 hover:bg-slate-700/50 hover:border-purple-400/40 group focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-900`}
              aria-label={social.label}
            >
              <Icon className="h-4 w-4 group-hover:animate-pulse" />
            </a>
          )
        })}
        
        {/* Decorative line */}
        <div className="w-0.5 h-12 bg-gradient-to-b from-purple-500/50 to-fuchsia-500/50 mx-auto rounded-full mt-2" />
      </div>
    </div>
  )
}

export default SocialSidebar