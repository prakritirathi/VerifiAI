import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAnalysis } from '../../context/AnalysisContext';

const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--background-primary);
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const PageHeader = styled.div`
  max-width: 1200px;
  margin: 0 auto 3rem;
  text-align: center;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const PageSubtitle = styled.p`
  font-size: 1.1rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
`;

const ReportContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;

  @media (max-width: 768px) {
    gap: 0.25rem;
  }
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 1rem 1.5rem;
  border: none;
  border-radius: var(--radius-lg);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: 150px;

  ${props => props.$active ? `
    background: var(--primary-color);
    color: white;
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  ` : `
    background: var(--background-secondary);
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
  `}

  &:hover {
    ${props => !props.$active && `
      background: var(--background-tertiary);
      border-color: var(--primary-color);
    `}
  }

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    min-width: 120px;
    font-size: 0.875rem;
  }
`;

const TabContent = styled(motion.div)`
  background: var(--background-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  padding: 2rem;
  box-shadow: var(--shadow-md);

  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: var(--radius-lg);
  }
`;

const ContentTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const PlaceholderContent = styled.div`
  text-align: center;
  color: var(--text-secondary);
  padding: 3rem 1rem;
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-lg);
  background: var(--background-secondary);
`;

const PlaceholderIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const PlaceholderText = styled.p`
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
`;

const PlaceholderSubtext = styled.p`
  font-size: 0.9rem;
  opacity: 0.7;
`;

const AnalysisOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled.div`
  background: var(--background-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  text-align: center;
`;

const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
`;

const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ReportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sources');
  const { state } = useAnalysis();

  const tabs = [
    { id: 'sources', label: 'Source Reliability' },
    { id: 'evidence', label: 'Cross-Reference Evidence' },
    { id: 'scam', label: 'Scam Indicators'},
    { id: 'media', label: 'Media Forensics'},
  ];

  const renderTabContent = () => {
    const content = {
      sources: {
        title: ' Source Trustworthiness Analysis',
        description: 'Analyze the reliability and credibility of information sources',
        content: state.currentAnalysis ? (
          <div>
            <AnalysisOverview>
              <MetricCard>
                <MetricValue>{state.currentAnalysis.sources.length}</MetricValue>
                <MetricLabel>Sources Found</MetricLabel>
              </MetricCard>
              <MetricCard>
                <MetricValue>
                  {state.currentAnalysis.sources.length > 0 
                    ? Math.round(state.currentAnalysis.sources.reduce((acc, s) => acc + s.reliability, 0) / state.currentAnalysis.sources.length)
                    : 0}%
                </MetricValue>
                <MetricLabel>Avg. Reliability</MetricLabel>
              </MetricCard>
              <MetricCard>
                <MetricValue>{state.currentAnalysis.credibilityScore.toFixed(0)}%</MetricValue>
                <MetricLabel>Overall Score</MetricLabel>
              </MetricCard>
            </AnalysisOverview>
            
            {state.currentAnalysis.sources.length > 0 ? (
              <div>
                {state.currentAnalysis.sources.map((source, index) => (
                  <div key={index} style={{ 
                    marginBottom: '1rem', 
                    padding: '1rem', 
                    background: 'var(--background-tertiary)', 
                    borderRadius: 'var(--radius-md)' 
                  }}>
                    <h4>{source.title}</h4>
                    <p>{source.organization} - Reliability: {source.reliability}%</p>
                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                      View Source
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <PlaceholderContent>
                <PlaceholderIcon>Sources</PlaceholderIcon>
                <PlaceholderText>No sources to analyze</PlaceholderText>
                <PlaceholderSubtext>Run an analysis to see source reliability information</PlaceholderSubtext>
              </PlaceholderContent>
            )}
          </div>
        ) : (
          <PlaceholderContent>
            <PlaceholderIcon>Analysis</PlaceholderIcon>
            <PlaceholderText>No analysis data available</PlaceholderText>
            <PlaceholderSubtext>Run a content analysis to see detailed source reliability assessment</PlaceholderSubtext>
          </PlaceholderContent>
        )
      },
      evidence: {
        title: 'Cross-Referenced Evidence',
        description: 'Evidence verification and fact-checking results',
        content: state.currentAnalysis ? (
          <div>
            <AnalysisOverview>
              <MetricCard>
                <MetricValue>{state.currentAnalysis.flags.length}</MetricValue>
                <MetricLabel>Issues Found</MetricLabel>
              </MetricCard>
              <MetricCard>
                <MetricValue>{state.currentAnalysis.flags.filter(f => f.severity === 'high').length}</MetricValue>
                <MetricLabel>High Severity</MetricLabel>
              </MetricCard>
              <MetricCard>
                <MetricValue>{Math.round(state.currentAnalysis.processingTime)}ms</MetricValue>
                <MetricLabel>Analysis Time</MetricLabel>
              </MetricCard>
            </AnalysisOverview>
            
            {state.currentAnalysis.flags.length > 0 ? (
              <div>
                {state.currentAnalysis.flags.map((flag, index) => (
                  <div key={index} style={{ 
                    marginBottom: '1rem', 
                    padding: '1rem', 
                    background: 'var(--background-tertiary)', 
                    borderRadius: 'var(--radius-md)' 
                  }}>
                    <h4>{flag.message}</h4>
                    <p>Severity: {flag.severity} | Category: {flag.category}</p>
                    {flag.description && <p>{flag.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <PlaceholderContent>
                <PlaceholderText>No evidence issues found</PlaceholderText>
                <PlaceholderSubtext>This content appears to have good evidence backing</PlaceholderSubtext>
              </PlaceholderContent>
            )}
          </div>
        ) : (
          <PlaceholderContent>
            <PlaceholderText>No analysis data available</PlaceholderText>
            <PlaceholderSubtext>Run a content analysis to see cross-reference verification results</PlaceholderSubtext>
          </PlaceholderContent>
        )
      },
      scam: {
        title: 'Scam & Phishing Detection',
        description: 'Suspicious patterns and fraud indicators',
        content: (
          <PlaceholderContent>
            <PlaceholderText>Scam detection analysis</PlaceholderText>
            <PlaceholderSubtext>Advanced pattern recognition for suspicious content and fraud indicators</PlaceholderSubtext>
          </PlaceholderContent>
        )
      },
      media: {
        title: ' Media Authenticity Analysis',
        description: 'Image and video manipulation detection',
        content: (
          <PlaceholderContent>
            <PlaceholderText>Media forensics analysis</PlaceholderText>
            <PlaceholderSubtext>Upload images or videos to check for manipulation and authenticity</PlaceholderSubtext>
          </PlaceholderContent>
        )
      }
    };

    return content[activeTab as keyof typeof content];
  };

  const currentContent = renderTabContent();

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Detailed Analysis Report</PageTitle>
        <PageSubtitle>
          Comprehensive breakdown of credibility analysis with detailed insights and evidence
        </PageSubtitle>
      </PageHeader>

      <ReportContainer>
        <TabContainer>
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              $active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </TabButton>
          ))}
        </TabContainer>

        <TabContent
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ContentTitle>
            {currentContent.title}
          </ContentTitle>
          {currentContent.content}
        </TabContent>
      </ReportContainer>
    </PageContainer>
  );
};

export default ReportPage;