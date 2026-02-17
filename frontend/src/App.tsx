import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import PostPage from './pages/PostPage';
import AgentPage from './pages/AgentPage';
import DirectoryPage from './pages/DirectoryPage';
import SearchPage from './pages/SearchPage';
import AboutPage from './pages/AboutPage';
import WhispersPage from './pages/WhispersPage';
import ModLogPage from './pages/ModLogPage';
import DealsPage from './pages/DealsPage';
import NotificationsPage from './pages/NotificationsPage';
import LandingPage from './pages/LandingPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/posts/:id" element={<PostPage />} />
          <Route path="/agents" element={<DirectoryPage />} />
          <Route path="/agents/:id" element={<AgentPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/whispers" element={<WhispersPage />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/mod-log" element={<ModLogPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
