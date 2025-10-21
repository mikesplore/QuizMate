import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BookOpen, FileText, CreditCard, ClipboardList, BarChart3, Sparkles } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Upload', icon: FileText },
    { path: '/quiz', label: 'Quiz', icon: ClipboardList },
    { path: '/flashcards', label: 'Flashcards', icon: CreditCard },
    { path: '/study-notes', label: 'Study Notes', icon: BookOpen },
    { path: '/results', label: 'Results', icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-secondary-white via-white to-brand-blue-light">
      {/* Modern Header with Gradient */}
      <header className="bg-gradient-brand shadow-lg sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
              <div className="relative">
                <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-primary-black group-hover:scale-110 transition-transform" />
                <Sparkles className="w-4 h-4 text-brand-yellow absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-primary-black tracking-tight">QuizMate</h1>
                <p className="text-xs text-secondary-black hidden sm:block">AI-Powered Learning</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-white/20 text-primary-black shadow-lg backdrop-blur-sm'
                        : 'text-secondary-black hover:bg-white/10 hover:text-primary-black'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-primary-black" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Mobile Menu Button */}
          </div>

          {/* Mobile Navigation */}
          <nav className="md:hidden pb-4 overflow-x-auto">
            <div className="flex space-x-2 scrollbar-thin">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex flex-col items-center justify-center min-w-[70px] px-3 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-white/20 text-primary-black'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <span className="text-xs font-medium whitespace-nowrap">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {children}
      </main>

      {/* Modern Footer */}
      <footer className="bg-primary-black text-white border-t border-secondary-black/20 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Sparkles className="w-4 h-4 text-brand-yellow" />
              <p>Powered by Google Gemini 2.0 Flash <span className="mx-2">|</span> Developed by Mike</p>
            </div>
            <p className="text-sm text-gray-400">© 2025 QuizMate - All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
