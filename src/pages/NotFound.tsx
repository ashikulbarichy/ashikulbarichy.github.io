import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const goBack = () => {
    window.history.back()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-8 max-w-md mx-auto section-padding">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-bold heading-gradient">404</h1>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Page Not Found</h2>
          <p className="text-gray-400 leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Go Home</span>
          </Link>
          
          <button
            onClick={goBack}
            className="inline-flex items-center space-x-2 px-6 py-3 glass-effect text-white rounded-full font-medium hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  )
}