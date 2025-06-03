import { Toaster } from 'sonner';
import { Router } from './components/Router';
import { ThemeProvider } from './contexts/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
        <Toaster />
        <Router />
      </div>
    </ThemeProvider>
  );
}
