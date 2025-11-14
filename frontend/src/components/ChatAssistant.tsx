import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, User, Loader2, X, Minimize2, Maximize2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { sendChatMessage, getChatHistory } from '../services/api'
import { ChatMessage } from '../types'
import { useStore } from '../store/useStore'

interface ChatAssistantProps {
  sessionId: string
  isOpen: boolean
  onClose: () => void
}

export default function ChatAssistant({ sessionId, isOpen, onClose }: ChatAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load chat history whenever sessionId changes (including on mount/refresh)
  useEffect(() => {
    if (sessionId) {
      loadChatHistory()
    }
  }, [sessionId, user?.user_id])

  const loadChatHistory = async () => {
    try {
      const history = await getChatHistory(sessionId, user?.user_id)
      if (history.messages) {
        setMessages(history.messages)
      }
    } catch (error) {
      console.error('Failed to load chat history:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await sendChatMessage({
        session_id: sessionId,
        user_id: user?.user_id,
        message: inputMessage,
        conversation_history: messages,
      })

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: response.timestamp,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className={`fixed ${isExpanded ? 'inset-4' : 'bottom-4 right-4 w-[420px] h-[600px]'} bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50 transition-all duration-300`}
    >
      {/* Header */}
      <div className="bg-black text-white p-4 flex items-center justify-between rounded-t-xl">
        <div className="flex items-center space-x-3">
          <MessageCircle className="h-5 w-5" />
          <h3 className="font-bold text-sm uppercase tracking-wide">Study Assistant</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="hover:bg-white hover:text-black rounded p-1.5 transition-colors"
            title={isExpanded ? 'Minimize' : 'Expand'}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={onClose}
            className="hover:bg-white hover:text-black rounded p-1.5 transition-colors"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
        {messages.length === 0 && (
          <div className="text-center mt-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <MessageCircle className="h-8 w-8 text-gray-600" />
            </div>
            <p className="text-sm font-medium text-gray-700">Ask me anything about your study material</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
              {/* Role label */}
              <div className="mb-1 flex items-center space-x-2">
                <div className={`w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center ${message.role === 'user' ? 'ml-auto' : ''}`}>
                  <User className="h-3 w-3 text-gray-700" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  {message.role === 'user' ? 'You' : 'Assistant'}
                </span>
              </div>
              
              {/* Message bubble */}
              <div className={`rounded-lg p-4 ${message.role === 'user' ? 'bg-black text-white' : 'bg-gray-50 text-black border border-gray-200'}`}>
                {message.role === 'assistant' ? (
                  <div className="text-sm prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-black prose-p:text-black prose-li:text-black prose-strong:text-black">
                    <ReactMarkdown
                      components={{
                        a: ({ node, ...props }) => (
                          <a
                            {...props}
                            className="underline hover:no-underline font-medium"
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        ),
                        code: ({ node, ...props }) => (
                          <code
                            {...props}
                            className="bg-gray-200 text-gray-800 px-1 py-0.5 rounded text-xs font-mono"
                          />
                        ),
                        pre: ({ node, ...props }) => (
                          <pre
                            {...props}
                            className="bg-black text-white p-3 rounded overflow-x-auto text-xs my-2 font-mono"
                          />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul {...props} className="list-disc list-outside ml-5 my-2 space-y-1" />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol {...props} className="list-decimal list-outside ml-5 my-2 space-y-1" />
                        ),
                        strong: ({ node, ...props }) => (
                          <strong {...props} className="font-bold" />
                        ),
                        em: ({ node, ...props }) => (
                          <em {...props} className="italic" />
                        ),
                        h1: ({ node, ...props }) => (
                          <h1 {...props} className="text-lg font-bold mt-4 mb-2" />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2 {...props} className="text-base font-bold mt-3 mb-2" />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3 {...props} className="text-sm font-bold mt-2 mb-1" />
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
              
              {/* Timestamp */}
              <p className="text-xs mt-1 text-gray-500">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[85%]">
              <div className="mb-1 flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="h-3 w-3 text-gray-700" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-600">Assistant</span>
              </div>
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl">
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your question..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black resize-none font-medium text-sm"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="bg-black text-white rounded-lg px-5 py-2 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-bold"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
