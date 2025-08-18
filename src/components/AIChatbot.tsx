import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Trash2,
  Settings,
  Download,
  Copy,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

const AIChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat sessions from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('youtube-analytics-chat-sessions');
    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions).map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
      setSessions(parsedSessions);
      
      if (parsedSessions.length > 0) {
        const lastSession = parsedSessions[parsedSessions.length - 1];
        setCurrentSessionId(lastSession.id);
        setMessages(lastSession.messages);
      }
    }
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('youtube-analytics-chat-sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: `Chat ${sessions.length + 1}`,
      messages: [],
      createdAt: new Date()
    };
    
    setSessions(prev => [...prev, newSession]);
    setCurrentSessionId(newSession.id);
    setMessages([]);
    setError(null);
  };

  const switchSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      setError(null);
    }
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    
    if (currentSessionId === sessionId) {
      const remainingSessions = sessions.filter(s => s.id !== sessionId);
      if (remainingSessions.length > 0) {
        const lastSession = remainingSessions[remainingSessions.length - 1];
        setCurrentSessionId(lastSession.id);
        setMessages(lastSession.messages);
      } else {
        setCurrentSessionId(null);
        setMessages([]);
      }
    }
    
    toast.success("Chat session deleted");
  };

  const updateSessionTitle = (sessionId: string, title: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId ? { ...session, title } : session
    ));
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    // Create new session if none exists
    if (!currentSessionId) {
      createNewSession();
    }

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      // Call Supabase Edge Function for AI chat
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input.trim(),
          history: messages.slice(-10) // Send last 10 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      const updatedMessages = [...messages, userMessage, assistantMessage];
      setMessages(updatedMessages);

      // Update current session
      if (currentSessionId) {
        setSessions(prev => prev.map(session => 
          session.id === currentSessionId 
            ? { 
                ...session, 
                messages: updatedMessages,
                title: session.title === `Chat ${sessions.length}` && updatedMessages.length === 2 
                  ? input.trim().slice(0, 30) + (input.trim().length > 30 ? '...' : '')
                  : session.title
              }
            : session
        ));
      }

    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to get AI response";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Message copied to clipboard");
  };

  const exportChat = () => {
    if (messages.length === 0) {
      toast.error("No messages to export");
      return;
    }

    const chatExport = messages.map(msg => 
      `[${msg.timestamp.toLocaleString()}] ${msg.role.toUpperCase()}: ${msg.content}`
    ).join('\n\n');

    const blob = new Blob([chatExport], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Chat exported successfully");
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-secondary shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            AI Assistant ChatBot
            <Badge variant="secondary" className="ml-auto">
              <Sparkles className="w-3 h-3 mr-1" />
              GPT-4 Powered
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[600px]">
            {/* Chat Sessions Sidebar */}
            <div className="lg:col-span-1 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">Chat Sessions</h3>
                <Button size="sm" variant="outline" onClick={createNewSession}>
                  <MessageSquare className="w-3 h-3" />
                </Button>
              </div>
              
              <ScrollArea className="h-[200px] lg:h-[520px]">
                <div className="space-y-1">
                  {sessions.map(session => (
                    <div key={session.id} className="group">
                      <Button
                        variant={currentSessionId === session.id ? "secondary" : "ghost"}
                        size="sm"
                        className="w-full justify-between text-left h-auto p-2"
                        onClick={() => switchSession(session.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">{session.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {session.messages.length} messages
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 p-1 h-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSession(session.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </Button>
                    </div>
                  ))}
                  
                  {sessions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">No chat sessions yet</p>
                      <Button size="sm" variant="outline" onClick={createNewSession} className="mt-2">
                        Start New Chat
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-3 flex flex-col">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">
                    {sessions.find(s => s.id === currentSessionId)?.title || "AI Assistant"}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={exportChat} disabled={messages.length === 0}>
                    <Download className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Settings className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">Welcome to AI Assistant!</p>
                      <p className="text-sm">Ask me anything about YouTube analytics, productivity, or general questions.</p>
                      <div className="flex flex-wrap justify-center gap-2 mt-4">
                        <Badge variant="outline" className="text-xs">Video Analysis</Badge>
                        <Badge variant="outline" className="text-xs">Task Management</Badge>
                        <Badge variant="outline" className="text-xs">Productivity Tips</Badge>
                        <Badge variant="outline" className="text-xs">General Help</Badge>
                      </div>
                    </div>
                  )}

                  {messages.map(message => (
                    <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          message.role === 'user' ? 'bg-primary' : 'bg-muted'
                        }`}>
                          {message.role === 'user' ? (
                            <User className="w-4 h-4 text-primary-foreground" />
                          ) : (
                            <Bot className="w-4 h-4 text-foreground" />
                          )}
                        </div>
                        <div className={`rounded-lg p-3 ${
                          message.role === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-foreground'
                        }`}>
                          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                          <div className="flex items-center justify-between mt-2">
                            <div className={`text-xs opacity-70`}>
                              {message.timestamp.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="p-1 h-auto opacity-70 hover:opacity-100"
                              onClick={() => copyMessage(message.content)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Bot className="w-4 h-4 animate-pulse" />
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Error Display */}
              {error && (
                <Alert variant="destructive" className="m-4">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    placeholder="Type your message here..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={isLoading || !input.trim()}
                    className="px-4"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Press Enter to send, Shift+Enter for new line
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIChatbot;