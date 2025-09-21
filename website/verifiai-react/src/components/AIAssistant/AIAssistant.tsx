import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';

const ChatWidget = styled(motion.div)`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 350px;
  max-height: 500px;
  background: var(--background-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--border-light);
  z-index: 1000;
  overflow: hidden;

  @media (max-width: 768px) {
    width: calc(100vw - 2rem);
    right: 1rem;
    left: 1rem;
    bottom: 1rem;
  }
`;

const ChatHeader = styled.div`
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: white;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
`;

const ChatTitle = styled.div`
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ChatToggle = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: var(--radius-sm);
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const ChatBody = styled(motion.div)`
  display: flex;
  flex-direction: column;
  height: 400px;
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: var(--background-secondary);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--text-light);
  }
`;

const Message = styled.div<{ $isUser: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  animation: fadeIn 0.3s ease;

  ${props => props.$isUser && `
    flex-direction: row-reverse;
  `}

  @keyframes fadeIn {
    0% { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
`;

const MessageAvatar = styled.div<{ $isUser: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
  
  ${props => props.$isUser ? `
    background: var(--primary-color);
    color: white;
  ` : `
    background: var(--background-tertiary);
    color: var(--text-primary);
  `}
`;

const MessageContent = styled.div<{ $isUser: boolean }>`
  max-width: 250px;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-lg);
  font-size: 0.875rem;
  line-height: 1.4;
  
  ${props => props.$isUser ? `
    background: var(--primary-color);
    color: white;
    border-bottom-right-radius: var(--radius-sm);
  ` : `
    background: var(--background-secondary);
    color: var(--text-primary);
    border-bottom-left-radius: var(--radius-sm);
  `}
`;

const ChatInputContainer = styled.div`
  padding: 1rem;
  border-top: 1px solid var(--border-light);
  display: flex;
  gap: 0.5rem;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  font-size: 0.875rem;
  background: var(--background-primary);

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }

  &::placeholder {
    color: var(--text-light);
  }
`;

const SendButton = styled.button`
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  padding: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: var(--primary-dark);
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--background-secondary);
  border-radius: var(--radius-lg);
  border-bottom-left-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-style: italic;
  max-width: 250px;

  .dots {
    display: flex;
    gap: 2px;
  }

  .dot {
    width: 4px;
    height: 4px;
    background: var(--text-light);
    border-radius: 50%;
    animation: typing 1.5s infinite;
  }

  .dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes typing {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-8px); }
  }
`;

const QuickActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const QuickAction = styled.button`
  background: var(--background-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }
`;

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hi! I'm your AI assistant powered by Gemini. I can help you understand credibility analysis results, explain fact-checking techniques, or answer questions about misinformation. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize Gemini AI (you'll need to add your API key)
  const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY || 'your-api-key-here');

  const quickActions = [
    "How accurate is this analysis?",
    "What should I look for in fake news?",
    "Explain the credibility score",
    "How to verify sources?",
    "What are red flags for misinformation?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || input.trim();
    if (!content) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Get AI response using Gemini
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `You are an AI assistant specialized in fact-checking and credibility analysis. You help users understand misinformation, verify sources, and interpret credibility scores. 

Context: This is part of VerifiAI, a fact-checking platform that uses AI to analyze content credibility.

User question: ${content}

Please provide a helpful, accurate, and concise response focused on fact-checking, media literacy, and credibility analysis. Keep responses under 150 words.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiResponse = response.text();

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Fallback response if API fails
      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting to my AI service right now. Please try again later. In the meantime, remember to always verify information from multiple reliable sources!",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickAction = (action: string) => {
    sendMessage(action);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Focus input when opening
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <ChatWidget
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ChatHeader onClick={toggleChat}>
        <ChatTitle>
          AI Assistant
        </ChatTitle>
        <ChatToggle>
          {isOpen ? '−' : '+'}
        </ChatToggle>
      </ChatHeader>

      <AnimatePresence>
        {isOpen && (
          <ChatBody
            initial={{ height: 0 }}
            animate={{ height: 400 }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChatMessages>
              {messages.map((message) => (
                <Message key={message.id} $isUser={message.isUser}>
                  <MessageAvatar $isUser={message.isUser}>
                    {message.isUser ? 'You' : 'AI'}
                  </MessageAvatar>
                  <MessageContent $isUser={message.isUser}>
                    {message.content}
                  </MessageContent>
                </Message>
              ))}

              {isTyping && (
                <Message $isUser={false}>
                  <MessageAvatar $isUser={false}>AI</MessageAvatar>
                  <TypingIndicator>
                    AI is thinking...
                    <div className="dots">
                      <div className="dot"></div>
                      <div className="dot"></div>
                      <div className="dot"></div>
                    </div>
                  </TypingIndicator>
                </Message>
              )}

              {messages.length === 1 && !isTyping && (
                <QuickActions>
                  {quickActions.map((action, index) => (
                    <QuickAction
                      key={index}
                      onClick={() => handleQuickAction(action)}
                    >
                      {action}
                    </QuickAction>
                  ))}
                </QuickActions>
              )}

              <div ref={messagesEndRef} />
            </ChatMessages>

            <ChatInputContainer>
              <ChatInput
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about credibility analysis..."
                disabled={isTyping}
              />
              <SendButton
                onClick={() => sendMessage()}
                disabled={isTyping || !input.trim()}
              >
                Send
              </SendButton>
            </ChatInputContainer>
          </ChatBody>
        )}
      </AnimatePresence>
    </ChatWidget>
  );
};

export default AIAssistant;