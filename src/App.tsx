import { QueryClientProvider } from '@tanstack/react-query';
import { Router, Route, Switch } from 'wouter';
import { queryClient } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Landing from '@/pages/Landing';
import AuthPage from '@/pages/AuthPage';
import Dashboard from '@/pages/Dashboard';
import ResumeBuilder from '@/pages/ResumeBuilder';
import TemplateSelector from '@/pages/TemplateSelector';
import NotFound from '@/pages/NotFound';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    window.location.href = '/auth';
    return null;
  }

  return <>{children}</>;
}

function AppRouter() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <Switch>
        <Route path="/" component={user ? Dashboard : Landing} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/dashboard">
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/resume/:id">
          {(params) => (
            <ProtectedRoute>
              <ResumeBuilder resumeId={params.id} />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/templates">
          <ProtectedRoute>
            <TemplateSelector />
          </ProtectedRoute>
        </Route>
        <Route path="/create-resume">
          <ProtectedRoute>
            <ResumeBuilder />
          </ProtectedRoute>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <AppRouter />
      </div>
    </QueryClientProvider>
  );
}

export default App;