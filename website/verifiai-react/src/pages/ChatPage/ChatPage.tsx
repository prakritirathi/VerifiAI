import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  position: relative;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ChatContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  height: calc(100vh - 160px);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    height: calc(100vh - 120px);
    border-radius: var(--radius-lg);
  }
`;

const ChatHeader = styled.div`
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: white;
  padding: 1.5rem;
  text-align: center;
`;

const ChatTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
`;

const ChatSubtitle = styled.p`
  opacity: 0.9;
  font-size: 0.95rem;
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: var(--background-primary);

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--background-secondary);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--text-light);
  }
`;

const Message = styled(motion.div)<{ $isUser: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  max-width: 85%;
  align-self: ${props => props.$isUser ? 'flex-end' : 'flex-start'};

  ${props => props.$isUser && `
    flex-direction: row-reverse;
  `}
`;

const MessageAvatar = styled.div<{ $isUser: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
  
  ${props => props.$isUser ? `
    background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
    color: white;
  ` : `
    background: var(--background-tertiary);
    color: var(--text-primary);
    border: 2px solid var(--border-light);
  `}
`;

const MessageBubble = styled.div<{ $isUser: boolean }>`
  padding: 1rem 1.25rem;
  border-radius: var(--radius-xl);
  font-size: 0.95rem;
  line-height: 1.5;
  max-width: 100%;
  word-wrap: break-word;
  
  ${props => props.$isUser ? `
    background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
    color: white;
    border-bottom-right-radius: var(--radius-md);
  ` : `
    background: var(--background-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-light);
    border-bottom-left-radius: var(--radius-md);
  `}
`;

const MessageTime = styled.div`
  font-size: 0.75rem;
  color: var(--text-light);
  margin-top: 0.5rem;
  text-align: center;
`;

const TypingIndicator = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1rem;
  max-width: 85%;
  align-self: flex-start;
`;

const TypingBubble = styled.div`
  background: var(--background-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  border-bottom-left-radius: var(--radius-md);
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-style: italic;

  .dots {
    display: flex;
    gap: 3px;
  }

  .dot {
    width: 6px;
    height: 6px;
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
    0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
    30% { transform: translateY(-8px); opacity: 1; }
  }
`;

const ChatInputContainer = styled.div`
  padding: 1.5rem;
  background: var(--background-secondary);
  border-top: 1px solid var(--border-light);
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-end;
`;

const ChatInput = styled.textarea`
  flex: 1;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  font-size: 0.95rem;
  background: var(--background-primary);
  resize: none;
  min-height: 50px;
  max-height: 120px;
  line-height: 1.4;
  font-family: inherit;

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
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  padding: 1rem 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  height: 50px;
  transition: all 0.2s ease;
  font-size: 1.1rem;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, var(--primary-dark), var(--primary-color));
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const QuickPrompts = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const QuickPrompt = styled.button`
  background: var(--background-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
    transform: translateY(-1px);
  }
`;

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hello! I'm your AI fact-checking assistant powered by Gemini. I can help you understand misinformation, analyze content credibility, learn about fact-checking techniques, and answer questions about media literacy. What would you like to know?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY || 'your-api-key-here');

  const quickPrompts = [
    "How can I spot fake news?",
    "What makes a source reliable?",
    "Explain deepfakes and AI-generated content",
    "How to verify images on social media?",
    "What are common misinformation tactics?",
    "How to fact-check a claim?",
    "Why is media literacy important?",
    "How to identify bias in news?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

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
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `You are an expert AI assistant specializing in fact-checking, media literacy, and misinformation detection. You are part of VerifiAI, a credibility analysis platform.

Your expertise includes:
- Identifying misinformation and disinformation patterns
- Teaching fact-checking methodologies
- Explaining source verification techniques
- Analyzing media authenticity and manipulation
- Understanding bias and propaganda techniques
- Digital literacy and critical thinking skills

User question: ${content}

Please provide a helpful, accurate, and educational response. Be conversational but authoritative. Include practical tips when relevant. Keep responses under 200 words but be thorough.`;

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
      
      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm experiencing technical difficulties connecting to my AI service. Here are some general fact-checking tips: Always verify information with multiple reliable sources, check the original source of claims, look for author credentials, check publication dates, and be wary of emotional or sensational language. Please try your question again in a moment!",
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

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <PageContainer>
      <ChatContainer>
        <ChatHeader>
          <ChatTitle>
             AI Fact-Checking Assistant
          </ChatTitle>
          <ChatSubtitle>
            Powered by Gemini AI • Ask me anything about misinformation and fact-checking
          </ChatSubtitle>
        </ChatHeader>

        <ChatMessages>
          {messages.map((message) => (
            <Message
              key={message.id}
              $isUser={message.isUser}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <MessageAvatar $isUser={message.isUser}>
                {message.isUser ? 'You' : 'AI'}
              </MessageAvatar>
              <div>
                <MessageBubble $isUser={message.isUser}>
                  {message.content}
                </MessageBubble>
                <MessageTime>
                  {formatTime(message.timestamp)}
                </MessageTime>
              </div>
            </Message>
          ))}

          {isTyping && (
            <TypingIndicator
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <MessageAvatar $isUser={false}>AI</MessageAvatar>
              <TypingBubble>
                AI is analyzing your question...
                <div className="dots">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              </TypingBubble>
            </TypingIndicator>
          )}

          <div ref={messagesEndRef} />
        </ChatMessages>

        <ChatInputContainer>
          {messages.length <= 1 && !isTyping && (
            <QuickPrompts>
              {quickPrompts.map((prompt, index) => (
                <QuickPrompt
                  key={index}
                  onClick={() => handleQuickPrompt(prompt)}
                >
                  {prompt}
                </QuickPrompt>
              ))}
            </QuickPrompts>
          )}

          <InputWrapper>
            <ChatInput
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about fact-checking, misinformation, or media literacy..."
              disabled={isTyping}
              rows={1}
            />
            <SendButton
              onClick={() => sendMessage()}
              disabled={isTyping || !input.trim()}
            >
              Enter
            </SendButton>
          </InputWrapper>
        </ChatInputContainer>
      </ChatContainer>
    </PageContainer>
  );
};

export default ChatPage;