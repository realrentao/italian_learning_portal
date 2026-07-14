import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import VocabularyPage from './pages/VocabularyPage';
import VerbPage from './pages/VerbPage';
import ExercisePage from './pages/ExercisePage';
import IdiomPage from './pages/IdiomPage';

// 应用路由骨架
// 所有页面都包裹在 Layout 内，Layout 负责导航栏 + 页脚 + 内容容器
export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/vocabulary" element={<VocabularyPage />} />
        <Route path="/verbs" element={<VerbPage />} />
        <Route path="/exercises" element={<ExercisePage />} />
        <Route path="/idioms" element={<IdiomPage />} />
        {/* 兜底：未匹配路由回首页 */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Layout>
  );
}
