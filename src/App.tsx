import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BookDetails from "./pages/BookDetails";
import CreateBook from "./pages/CreateBook";
import EditChapter from "./pages/EditChapter";
import ChapterDetail from "./pages/ChapterDetail";
import DocsOverview from "./pages/DocsOverview";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/books/new" element={
        <ProtectedRoute>
          <CreateBook />
        </ProtectedRoute>
      } />
      
      <Route path="/books/:id" element={
        <ProtectedRoute>
          <BookDetails />
        </ProtectedRoute>
      } />
      
      <Route path="/books/:id/edit" element={
        <ProtectedRoute>
          <CreateBook />
        </ProtectedRoute>
      } />
      
      <Route path="/books/:bookId/chapters/new" element={
        <ProtectedRoute>
          <EditChapter />
        </ProtectedRoute>
      } />
      
      <Route path="/books/:bookId/chapters/:chapterId/edit" element={
        <ProtectedRoute>
          <EditChapter />
        </ProtectedRoute>
      } />
      
      <Route path="/books/:bookId/chapters/:chapterId" element={
        <ProtectedRoute>
          <ChapterDetail />
        </ProtectedRoute>
      } />
      
      <Route path="/docs/overview" element={
        <ProtectedRoute>
          <DocsOverview />
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
