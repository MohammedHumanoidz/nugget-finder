"use client"

import { useChat } from 'ai/react'
import { useRef, useEffect } from 'react'
import { Send, MessageCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { IdeaDetailsViewProps } from '@/types/idea-details'

interface NuggetChatProps {
  idea: IdeaDetailsViewProps['idea']
}

export default function NuggetChat({ idea }: NuggetChatProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/api/chat`,
    body: {
      ideaId: idea.id,
      ideaTitle: idea.title,
      ideaDescription: idea.description
    },
    onFinish: () => {
      // Scroll to bottom when message is finished
      setTimeout(() => {
        if (scrollAreaRef.current) {
          const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
          if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight
          }
        }
      }, 100)
    }
  })

  // Auto-scroll to bottom when new messages arrive or when loading state changes
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        // Smooth scroll to bottom
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        })
      }
    }
  }, [messages, Boolean(isLoading)])

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
      <div className="flex px-6 py-2">
        <Image
          src="/nugget-faq.webp"
          alt="nugget faq"
          width={100}
          height={100}
          className="w-20 h-20 object-cover"
        />
        <h3 className="bg-muted/50 text-foreground text-lg font-semibold flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Ask Pip the Prospector to dig deeper
        </h3>
      </div>
      
      <div className="p-4 py-0">
        <div className={`bg-muted/30 rounded-lg p-4 mb-4 min-h-[200px] flex flex-col ${
          isLoading ? 'border-2 border-primary/20 bg-primary/5' : ''
        }`}>
          {/* Chat Messages */}
          <ScrollArea 
            ref={scrollAreaRef}
            className="flex-1 h-[400px] w-full"
          >
            <div className="space-y-3 pr-4">
              {messages.length === 0 && (
                <div className="bg-primary/10 text-primary p-3 rounded-lg max-w-xs">
                  <p className="text-sm">
                    Howdy fellow miner! Curious about this nugget. Ask me
                    anything about the market opportunity, risks,
                    competitive analysis, or implementation details.
                  </p>
                </div>
              )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-muted text-foreground ml-auto'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    <div className="text-sm">
                      {message.role === 'user' ? (
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      ) : (
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-primary">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-primary">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-primary">{children}</h3>,
                            p: ({ children }) => <p className="mb-2 last:mb-0 text-primary">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-2 text-primary">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 text-primary">{children}</ol>,
                            li: ({ children }) => <li className="mb-1 text-primary">{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
                            em: ({ children }) => <em className="italic text-primary">{children}</em>,
                            code: ({ children }) => <code className="bg-primary/20 px-1 py-0.5 rounded text-xs text-primary">{children}</code>,
                            pre: ({ children }) => <pre className="bg-primary/20 p-2 rounded text-xs overflow-x-auto mb-2">{children}</pre>,
                            blockquote: ({ children }) => <blockquote className="border-l-4 border-primary/30 pl-3 italic mb-2">{children}</blockquote>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-xs bg-primary/10 text-primary p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Thinking...
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder={isLoading ? "Pip is thinking..." : "Ask me about this nugget..."}
              className={`flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                isLoading ? 'opacity-50' : ''
              }`}
              disabled={isLoading}
            />
            <Button type="submit" className="flex items-center gap-2" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Thinking
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send
                </>
              )}
            </Button>
          </form>

          {/* Quick Questions */}
          <div className="flex gap-2 mt-3 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const syntheticEvent = {
                  preventDefault: () => {},
                  currentTarget: { elements: { message: { value: "What are the main risks with this idea?" } } }
                } as any
                handleInputChange({ target: { value: "What are the main risks with this idea?" } } as any)
                setTimeout(() => handleSubmit(syntheticEvent), 0)
              }}
              className={`text-xs bg-muted hover:bg-muted/80 text-muted-foreground px-3 py-1 rounded-full transition-colors h-auto ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isLoading}
            >
              Show me risks
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const syntheticEvent = {
                  preventDefault: () => {},
                  currentTarget: { elements: { message: { value: "What's the market size for this opportunity?" } } }
                } as any
                handleInputChange({ target: { value: "What's the market size for this opportunity?" } } as any)
                setTimeout(() => handleSubmit(syntheticEvent), 0)
              }}
              className={`text-xs bg-muted hover:bg-muted/80 text-muted-foreground px-3 py-1 rounded-full transition-colors h-auto ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isLoading}
            >
              Market size
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const syntheticEvent = {
                  preventDefault: () => {},
                  currentTarget: { elements: { message: { value: "How do I validate this idea quickly?" } } }
                } as any
                handleInputChange({ target: { value: "How do I validate this idea quickly?" } } as any)
                setTimeout(() => handleSubmit(syntheticEvent), 0)
              }}
              className={`text-xs bg-muted hover:bg-muted/80 text-muted-foreground px-3 py-1 rounded-full transition-colors h-auto ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isLoading}
            >
              Validation strategy
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 