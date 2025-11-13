import { ReactNode, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, FileText, CreditCard, ClipboardList, BarChart3, User, LogOut, MessageCircle } from 'lucide-react'
import { useStore } from '../store/useStore'
import ChatAssistant from './ChatAssistant'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout, processedContent } = useStore()
  const [isChatOpen, setIsChatOpen] = useState(false)

  const navItems = [
    { path: '/', label: 'Upload', icon: FileText },
    { path: '/quiz', label: 'Quiz', icon: ClipboardList },
    { path: '/flashcards', label: 'Flashcards', icon: CreditCard },
    { path: '/study-notes', label: 'Study Notes', icon: BookOpen },
    { path: '/results', label: 'Results', icon: BarChart3 },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Chat is always available for authenticated users
  const showChatButton = isAuthenticated

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Professional Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
              <div className="bg-slate-900 p-2 rounded-lg group-hover:bg-slate-800 transition-colors">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">QuizMate</h1>
                <p className="text-xs text-slate-600 hidden sm:block">AI-Powered Learning</p>
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
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                )
              })}
              
              {/* Auth Actions */}
              <div className="ml-4 flex items-center space-x-2 border-l border-slate-200 pl-4">
                {isAuthenticated && user ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm">{user.full_name.split(' ')[0]}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Logout</span>
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm">Login</span>
                  </Link>
                )}
              </div>
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
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <span className="text-xs font-medium whitespace-nowrap">{item.label}</span>
                  </Link>
                )
              })}
              {/* Mobile Auth */}
              {isAuthenticated && user ? (
                <Link
                  to="/dashboard"
                  className="flex flex-col items-center justify-center min-w-[70px] px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  <User className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium whitespace-nowrap">Profile</span>
                </Link>
              ) : (
                <Link
                  to="/auth"
                  className="flex flex-col items-center justify-center min-w-[70px] px-3 py-2 rounded-lg bg-blue-600 text-white"
                >
                  <User className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium whitespace-nowrap">Login</span>
                </Link>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {children}
      </main>

      {/* Chat Button - Always visible for authenticated users */}
      {showChatButton && (
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="fixed bottom-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 z-40"
          title="AI Study Assistant - Get personalized recommendations"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Assistant - Works with or without document */}
      {showChatButton && (
        <ChatAssistant
          sessionId={processedContent?.session_id || user?.user_id || 'general'}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}

      {/* Professional Footer */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0">
            <p className="text-sm text-slate-400 text-center">
              Powered by Google Gemini 2.0 Flash | Developed by Mike | © 2025 QuizMate - All rights reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
