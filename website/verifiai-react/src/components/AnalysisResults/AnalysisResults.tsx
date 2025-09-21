import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { AnalysisResult } from '../../context/AnalysisContext';

const ResultsContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-xl);
  padding: 2rem;
  margin: 2rem auto;
  max-width: 900px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);

  @media (max-width: 768px) {
    margin: 1rem auto;
    padding: 1.5rem;
    border-radius: var(--radius-lg);
  }
`;

const ResultsHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const ResultsTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
`;

const ScoreSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const ScoreDisplay = styled.div`
  text-align: center;
`;

const ScoreValue = styled.div<{ $score: number }>`
  font-size: 3rem;
  font-weight: 700;
  color: ${props => {
    if (props.$score >= 80) return 'var(--success-color)';
    if (props.$score >= 60) return 'var(--warning-color)';
    if (props.$score >= 40) return '#fd7e14';
    return 'var(--danger-color)';
  }};
  line-height: 1;
`;

const ScoreLabel = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
  margin-top: 0.25rem;
`;

const RiskBadge = styled.div<{ $risk: string }>`
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-lg);
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => {
    switch (props.$risk) {
      case 'low':
        return `
          background: #DCFCE7;
          color: #166534;
          border: 1px solid #BBF7D0;
        `;
      case 'medium':
        return `
          background: #FEF3C7;
          color: #92400E;
          border: 1px solid #FDE68A;
        `;
      case 'high':
        return `
          background: #FEE2E2;
          color: #991B1B;
          border: 1px solid #FECACA;
        `;
      case 'very_high':
        return `
          background: #FEE2E2;
          color: #7F1D1D;
          border: 1px solid #FCA5A5;
        `;
      default:
        return `
          background: var(--background-tertiary);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        `;
    }
  }}
`;

const ExplanationSection = styled.div`
  margin: 2rem 0;
`;

const ExplanationTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ExplanationText = styled.p`
  color: var(--text-secondary);
  line-height: 1.6;
  font-size: 0.95rem;
`;

const FlagsSection = styled.div`
  margin: 2rem 0;
`;

const FlagsTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FlagsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const FlagItem = styled.div<{ $severity: string }>`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  border-left: 4px solid ${props => {
    switch (props.$severity) {
      case 'high': return 'var(--danger-color)';
      case 'medium': return 'var(--warning-color)';
      case 'low': return 'var(--success-color)';
      default: return 'var(--text-light)';
    }
  }};
  background: var(--background-secondary);
`;

const FlagSeverity = styled.span<{ $severity: string }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 60px;
  text-align: center;
  
  ${props => {
    switch (props.$severity) {
      case 'high':
        return `
          background: var(--danger-color);
          color: white;
        `;
      case 'medium':
        return `
          background: var(--warning-color);
          color: white;
        `;
      case 'low':
        return `
          background: var(--success-color);
          color: white;
        `;
      default:
        return `
          background: var(--text-light);
          color: white;
        `;
    }
  }}
`;

const FlagContent = styled.div`
  flex: 1;
`;

const FlagMessage = styled.div`
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
`;

const FlagDescription = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
`;

const SourcesSection = styled.div`
  margin: 2rem 0;
`;

const SourcesTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SourcesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SourceItem = styled.a`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  background: var(--background-secondary);
  border: 1px solid var(--border-light);
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.2s ease;

  &:hover {
    background: var(--background-tertiary);
    border-color: var(--primary-color);
    transform: translateY(-1px);
  }
`;

const SourceIcon = styled.div`
  font-size: 1.25rem;
`;

const SourceContent = styled.div`
  flex: 1;
`;

const SourceTitle = styled.div`
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const SourceOrg = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
`;

const MetaInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-light);
  font-size: 0.875rem;
  color: var(--text-light);

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
`;

const ProcessingTime = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const Timestamp = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const NoDataMessage = styled.div`
  text-align: center;
  color: var(--text-secondary);
  font-style: italic;
  padding: 1rem;
`;

interface AnalysisResultsProps {
  analysis: AnalysisResult;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysis }) => {
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return 'LOW';
      case 'medium': return 'MEDIUM';
      case 'high': return 'HIGH';
      case 'very_high': return 'VERY HIGH';
      default: return 'UNKNOWN';
    }
  };

  return (
    <ResultsContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ResultsHeader>
        <ResultsTitle>Credibility Analysis Results</ResultsTitle>
      </ResultsHeader>

      <ScoreSection>
        <ScoreDisplay>
          <ScoreValue $score={analysis.credibilityScore}>
            {Math.round(analysis.credibilityScore)}%
          </ScoreValue>
          <ScoreLabel>Credibility Score</ScoreLabel>
        </ScoreDisplay>

        <RiskBadge $risk={analysis.riskLevel}>
          {getRiskIcon(analysis.riskLevel)} Risk
        </RiskBadge>
      </ScoreSection>

      {analysis.explanation && (
        <ExplanationSection>
          <ExplanationTitle>
            Analysis Summary
          </ExplanationTitle>
          <ExplanationText>{analysis.explanation}</ExplanationText>
        </ExplanationSection>
      )}

      {analysis.flags && analysis.flags.length > 0 && (
        <FlagsSection>
          <FlagsTitle>
            Issues Detected ({analysis.flags.length})
          </FlagsTitle>
          <FlagsList>
            {analysis.flags.map((flag, index) => (
              <FlagItem key={index} $severity={flag.severity}>
                <FlagSeverity $severity={flag.severity}>
                  {flag.severity}
                </FlagSeverity>
                <FlagContent>
                  <FlagMessage>{flag.message}</FlagMessage>
                  {flag.description && (
                    <FlagDescription>{flag.description}</FlagDescription>
                  )}
                </FlagContent>
              </FlagItem>
            ))}
          </FlagsList>
        </FlagsSection>
      )}

      {analysis.sources && analysis.sources.length > 0 && (
        <SourcesSection>
          <SourcesTitle>
            Verification Sources ({analysis.sources.length})
          </SourcesTitle>
          <SourcesList>
            {analysis.sources.slice(0, 5).map((source, index) => (
              <SourceItem
                key={index}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <SourceContent>
                  <SourceTitle>{source.title}</SourceTitle>
                  <SourceOrg>{source.organization}</SourceOrg>
                </SourceContent>
              </SourceItem>
            ))}
            {analysis.sources.length > 5 && (
              <NoDataMessage>
                ...and {analysis.sources.length - 5} more sources
              </NoDataMessage>
            )}
          </SourcesList>
        </SourcesSection>
      )}

      <MetaInfo>
        <ProcessingTime>
          Analysis completed in {analysis.processingTime}ms
        </ProcessingTime>
        <Timestamp>
          {formatTimestamp(analysis.timestamp)}
        </Timestamp>
      </MetaInfo>
    </ResultsContainer>
  );
};

export default AnalysisResults;