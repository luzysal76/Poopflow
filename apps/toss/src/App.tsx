import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AddPoop from './pages/AddPoop';
import Water from './pages/Water';
import History from './pages/History';

export default function App() {
  return (
    <HashRouter>
      <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', minHeight: '100vh', background: 'white' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/poop/add" element={<AddPoop />} />
          <Route path="/water" element={<Water />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </div>
    </HashRouter>
  );
}
