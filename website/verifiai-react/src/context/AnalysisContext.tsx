import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AnalysisFlag {
  id: string;
  severity: 'low' | 'medium' | 'high';
  category: string;
  message: string;
  description?: string;
}

export interface AnalysisSource {
  id: string;
  title: string;
  url: string;
  organization: string;
  reliability: number;
  dateChecked: string;
}

export interface AnalysisResult {
  id: string;
  content: string;
  credibilityScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'very_high';
  explanation: string;
  flags: AnalysisFlag[];
  sources: AnalysisSource[];
  processingTime: number;
  timestamp: string;
  contentType: 'text' | 'url' | 'image';
}

export interface AnalysisState {
  currentAnalysis: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
  history: AnalysisResult[];
}

type AnalysisAction =
  | { type: 'START_ANALYSIS' }
  | { type: 'ANALYSIS_SUCCESS'; payload: AnalysisResult }
  | { type: 'ANALYSIS_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'CLEAR_CURRENT_ANALYSIS' }
  | { type: 'LOAD_HISTORY'; payload: AnalysisResult[] };

const initialState: AnalysisState = {
  currentAnalysis: null,
  isLoading: false,
  error: null,
  history: [],
};

function analysisReducer(state: AnalysisState, action: AnalysisAction): AnalysisState {
  switch (action.type) {
    case 'START_ANALYSIS':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'ANALYSIS_SUCCESS':
      return {
        ...state,
        isLoading: false,
        currentAnalysis: action.payload,
        history: [action.payload, ...state.history.slice(0, 9)],
        error: null,
      };
    case 'ANALYSIS_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'CLEAR_CURRENT_ANALYSIS':
      return {
        ...state,
        currentAnalysis: null,
        error: null,
      };
    case 'LOAD_HISTORY':
      return {
        ...state,
        history: action.payload,
      };
    default:
      return state;
  }
}

interface AnalysisContextType {
  state: AnalysisState;
  dispatch: React.Dispatch<AnalysisAction>;
  analyzeContent: (content: string, contentType?: 'text' | 'url' | 'image') => Promise<void>;
  clearCurrentAnalysis: () => void;
  clearError: () => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

interface AnalysisProviderProps {
  children: ReactNode;
}

export const AnalysisProvider: React.FC<AnalysisProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(analysisReducer, initialState);

  const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY || '');

  const analyzeWithGemini = async (content: string, contentType: 'text' | 'url' | 'image' = 'text') => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `You are an expert fact-checker and misinformation detector. Analyze the following ${contentType} content for credibility, accuracy, and potential misinformation.

Content: "${content}"

Please provide a JSON response with the following structure:
{
  "credibilityScore": <number between 0-100>,
  "riskLevel": "<low|medium|high>",
  "explanation": "<detailed explanation of the analysis>",
  "flags": [
    {
      "id": "<unique_id>",
      "severity": "<low|medium|high>",
      "category": "<category_name>",
      "message": "<flag_message>",
      "description": "<detailed_description>"
    }
  ],
  "sources": [
    {
      "id": "<unique_id>",
      "title": "<source_title>",
      "url": "<source_url>",
      "organization": "<organization_name>",
      "reliability": <number between 0-100>,
      "dateChecked": "<current_date>"
    }
  ],
  "summary": "<brief_summary>",
  "recommendations": "<actionable_recommendations>"
}

Focus on:
- Factual accuracy
- Source credibility
- Potential bias or manipulation
- Missing context
- Logical consistency
- Evidence quality

Be thorough but concise. Provide actionable insights.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const cleanedText = text.replace(/```json\s*|\s*```/g, '').trim();
        return JSON.parse(cleanedText);
      } catch (parseError) {
        console.warn('Failed to parse Gemini response as JSON, using fallback');
        return {
          credibilityScore: 50,
          riskLevel: 'medium',
          explanation: text,
          flags: [],
          sources: [],
          summary: 'Analysis completed but response format was unexpected.',
          recommendations: 'Please verify the content through additional sources.'
        };
      }
    } catch (error) {
      console.error('Gemini analysis error:', error);
      throw error;
    }
  };

  const analyzeContent = async (content: string, contentType: 'text' | 'url' | 'image' = 'text') => {
    try {
      dispatch({ type: 'START_ANALYSIS' });

      const startTime = Date.now();
      let analysisData;

      try {
        console.log('🤖 Analyzing with Gemini AI directly...');
        analysisData = await analyzeWithGemini(content, contentType);
      } catch (geminiError) {
        console.warn('Direct Gemini analysis failed, trying backend API...', geminiError);
        
        // Fallback to backend API
        const response = await fetch('http://localhost:3001/api/v1/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content,
            contentType,
            options: {
              includeExplanation: true,
              includeSources: true,
              confidenceThreshold: 0.6,
              analysisType: 'full'
            }
          }),
        });

        if (!response.ok) {
          throw new Error(`Analysis failed: ${response.status} ${response.statusText}`);
        }

        analysisData = await response.json();
      }

      const processingTime = Date.now() - startTime;

      // Transform API response to our format
      const result: AnalysisResult = {
        id: `analysis_${Date.now()}`,
        content,
        credibilityScore: analysisData.credibilityScore || 0,
        riskLevel: analysisData.riskLevel || 'medium',
        explanation: analysisData.explanation || 'No detailed explanation available.',
        flags: analysisData.flags || [],
        sources: analysisData.sources || [],
        processingTime,
        timestamp: new Date().toISOString(),
        contentType,
      };

      dispatch({ type: 'ANALYSIS_SUCCESS', payload: result });
    } catch (error) {
      console.error('Analysis failed:', error);
      dispatch({ 
        type: 'ANALYSIS_ERROR', 
        payload: error instanceof Error ? error.message : 'Analysis failed. Please try again.' 
      });
    }
  };

  const clearCurrentAnalysis = () => {
    dispatch({ type: 'CLEAR_CURRENT_ANALYSIS' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Load history from localStorage on mount
  React.useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('verifiai_analysis_history');
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        dispatch({ type: 'LOAD_HISTORY', payload: history });
      }
    } catch (error) {
      console.error('Failed to load analysis history:', error);
    }
  }, []);

  // Save history to localStorage when it changes
  React.useEffect(() => {
    try {
      localStorage.setItem('verifiai_analysis_history', JSON.stringify(state.history));
    } catch (error) {
      console.error('Failed to save analysis history:', error);
    }
  }, [state.history]);

  const value: AnalysisContextType = {
    state,
    dispatch,
    analyzeContent,
    clearCurrentAnalysis,
    clearError,
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
};

// Custom hook to use the analysis context
export const useAnalysis = (): AnalysisContextType => {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
};