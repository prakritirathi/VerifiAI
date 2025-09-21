import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-f  }

  @media (max-width: 768px) {y: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    line-height: 1.6;
    color: #1a1a1a;
    background-color: #ffffff;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  html {
    scroll-behavior: smooth;
  }

  .main-content {
    min-height: 100vh;
    padding-top: 80px;
  }

  :root {
    --primary-color: #4F46E5;
    --primary-light: #6366F1;
    --primary-dark: #3730A3;
    --secondary-color: #10B981;
    --accent-color: #F59E0B;
    --danger-color: #EF4444;
    --warning-color: #F59E0B;
    --success-color: #10B981;
    --text-primary: #1F2937;
    --text-secondary: #6B7280;
    --text-light: #9CA3AF;
    --background-primary: #FFFFFF;
    --background-secondary: #F9FAFB;
    --background-tertiary: #F3F4F6;
    --border-color: #E5E7EB;
    --border-light: #F3F4F6;
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    --radius-sm: 0.375rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-xl: 1rem;
  }

  .hidden {
    display: none !important;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes fadeIn {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideInUp {
    0% { transform: translateY(100%); }
    100% { transform: translateY(0); }
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    line-height: 1;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    min-height: 44px;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-primary {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 100%);
    transform: translateY(-1px);
    box-shadow: var(--shadow-lg);
  }

  .btn-secondary {
    background: var(--background-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
  }

  .btn-secondary:hover:not(:disabled) {
    background: var(--background-tertiary);
    border-color: var(--border-color);
  }

  .btn-success {
    background: var(--success-color);
    color: white;
  }

  .btn-warning {
    background: var(--warning-color);
    color: white;
  }

  .btn-danger {
    background: var(--danger-color);
    color: white;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--text-primary);
  }

  .form-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    font-size: 1rem;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .form-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }

  .form-textarea {
    min-height: 120px;
    resize: vertical;
  }

  .card {
    background: var(--background-primary);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
  }

  .card-header {
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-light);
    background: var(--background-secondary);
  }

  .card-body {
    padding: 1.5rem;
  }

  .card-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--border-light);
    background: var(--background-secondary);
  }

  /* Responsive breakpoints */
  @media (max-width: 640px) {
    .main-content {
      padding-top: 70px;
    }
    
    .btn {
      padding: 0.625rem 1.25rem;
      font-size: 0.875rem;
    }
  }

  @media (max-width: 768px) {
    .card-body {
      padding: 1rem;
    }
  }

  .risk-low {
    color: var(--success-color);
  }

  .risk-medium {
    color: var(--warning-color);
  }

  .risk-high {
    color: var(--danger-color);
  }

  .risk-very-high {
    color: #DC2626;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    border-radius: var(--radius-sm);
  }

  .badge-success {
    background: #DCFCE7;
    color: #166534;
  }

  .badge-warning {
    background: #FEF3C7;
    color: #92400E;
  }

  .badge-danger {
    background: #FEE2E2;
    color: #991B1B;
  }

  .badge-info {
    background: #DBEAFE;
    color: #1E40AF;
  }
`;