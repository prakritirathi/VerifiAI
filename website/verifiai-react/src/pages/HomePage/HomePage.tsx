import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnalysis } from '../../context/AnalysisContext';
import AnalysisResults from '../../components/AnalysisResults/AnalysisResults';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
`;

const BackgroundPattern = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  animation: float 20s ease-in-out infinite;

  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(1deg); }
  }
`;

const HeroSection = styled.section`
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem 2rem;
  text-align: center;

  @media (max-width: 768px) {
    padding: 2rem 1rem 1rem;
  }
`;

const HeroTitle = styled(motion.h1)`
  font-size: 3.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1.5rem;
  line-height: 1.1;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }

  @media (max-width: 480px) {
    font-size: 2rem;
  }

  .highlight {
    background: linear-gradient(135deg, #FFD700, #FFA500);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const HeroSubtitle = styled(motion.p)`
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }
`;

const InputSection = styled(motion.div)`
  max-width: 800px;
  margin: 0 auto 3rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-xl);
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);

  @media (max-width: 768px) {
    margin: 0 auto 2rem;
    padding: 1.5rem;
    border-radius: var(--radius-lg);
  }
`;

const InputWrapper = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
`;

const InputIcon = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  font-size: 1.5rem;
  color: var(--text-secondary);
  z-index: 2;
`;

const ShieldOverlay = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 1.5rem;
  opacity: 0.5;
  z-index: 2;
`;

const ContentInput = styled.textarea`
  width: 100%;
  padding: 1rem 3.5rem 1rem 3.5rem;
  border: 2px solid var(--border-light);
  border-radius: var(--radius-lg);
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical;
  min-height: 120px;
  transition: all 0.3s ease;
  background: var(--background-primary);

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
  }

  &::placeholder {
    color: var(--text-light);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;

  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;
  }
`;

const CheckButton = styled(motion.button)`
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: var(--radius-lg);
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  min-height: 56px;
  box-shadow: 0 4px 20px rgba(79, 70, 229, 0.3);

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(79, 70, 229, 0.4);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
  }

  .button-icon {
    font-size: 1.2rem;
  }
`;

const UrlButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.1);
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-lg);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: var(--primary-color);
    color: white;
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const LoadingState = styled(motion.div)`
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  font-size: 2rem;
  animation: spin 2s linear infinite;
  margin-bottom: 1rem;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  font-size: 1.1rem;
  font-weight: 500;
`;

const FeaturesSection = styled.section`
  position: relative;
  z-index: 1;
  background: var(--background-primary);
  padding: 4rem 2rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
`;

const FeaturesContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
`;

const FeaturesTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const FeatureCard = styled(motion.div)`
  background: var(--background-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  padding: 2rem;
  text-align: center;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-xl);
    border-color: var(--primary-color);
  }
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  filter: drop-shadow(0 4px 8px rgba(79, 70, 229, 0.2));
`;

const FeatureTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
`;

const FeatureDescription = styled.p`
  color: var(--text-secondary);
  line-height: 1.6;
`;

const HomePage: React.FC = () => {
  const [content, setContent] = useState('');
  const [isUrlMode, setIsUrlMode] = useState(false);
  const { state, analyzeContent } = useAnalysis();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const features = [
    {
      title: 'Instant Credibility Score',
      description: 'Real-time analysis with 0-100 scale credibility scoring powered by advanced AI'
    },
    {
      title: 'Text Fact-Checking',
      description: 'Advanced NLP to verify claims and detect misinformation in any text content'
    },
    {
      title: 'Fake Media Detection',
      description: 'Identify manipulated images, deepfakes, and doctored multimedia content'
    },
    {
      title: 'Scam & Phishing Alert',
      description: 'Detect suspicious links, fraudulent schemes, and malicious content'
    },
    {
      title: 'AI Assistant',
      description: 'Chat with AI to understand analysis results and get explanations in plain language'
    },
    {
      title: 'Source Verification',
      description: 'Cross-reference with trusted sources and professional fact-checkers'
    }
  ];

  const handleSubmit = async () => {
    if (!content.trim()) {
      inputRef.current?.focus();
      return;
    }

    const contentType = isUrlMode ? 'url' : 'text';
    await analyzeContent(content.trim(), contentType);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  const toggleUrlMode = () => {
    setIsUrlMode(!isUrlMode);
    setContent('');
    inputRef.current?.focus();
  };

  return (
    <PageContainer>
      <BackgroundPattern />
      
      <HeroSection>
        <HeroTitle
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          VerifiAI — <span className="highlight">Instant Truth</span>, Simplified
        </HeroTitle>
        
        <HeroSubtitle
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Advanced AI-powered fact-checking and credibility analysis powered by Gemini AI
        </HeroSubtitle>

        <InputSection
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <InputWrapper>
            <ContentInput
              ref={inputRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={isUrlMode 
                ? "Enter a URL to analyze (e.g., https://example.com/article)" 
                : "Paste text, claim, or content to verify..."}
              rows={isUrlMode ? 2 : 4}
            />
          </InputWrapper>

          <ButtonGroup>
            <CheckButton
              onClick={handleSubmit}
              disabled={state.isLoading || !content.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="button-text">
                {state.isLoading ? 'Analyzing...' : 'Check Now'}
              </span>
              <span className="button-icon">
                {state.isLoading ? '...' : ''}
              </span>
            </CheckButton>

            <UrlButton
              onClick={toggleUrlMode}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isUrlMode ? 'Switch to Text' : 'Analyze URL'}
            </UrlButton>
          </ButtonGroup>

          <AnimatePresence>
            {state.isLoading && (
              <LoadingState
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <LoadingSpinner>...</LoadingSpinner>
                <LoadingText>Analyzing content with Gemini AI...</LoadingText>
              </LoadingState>
            )}
          </AnimatePresence>
        </InputSection>

        <AnimatePresence>
          {state.currentAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <AnalysisResults analysis={state.currentAnalysis} />
            </motion.div>
          )}
        </AnimatePresence>
      </HeroSection>

      <FeaturesSection>
        <FeaturesContainer>
          <FeaturesTitle>Comprehensive Truth Detection</FeaturesTitle>
          
          <FeaturesGrid>
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>
              </FeatureCard>
            ))}
          </FeaturesGrid>
        </FeaturesContainer>
      </FeaturesSection>
    </PageContainer>
  );
};

export default HomePage;