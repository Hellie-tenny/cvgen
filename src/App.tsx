import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout'
import Home from './pages/Home'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Builder from './pages/Builder'
import CoverLetter from './pages/CoverLetter'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Content pages — safe to run ads on these */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Route>

        {/* Tool pages — no ads, noindex, no footer */}
        <Route path="/builder" element={<Builder />} />
        <Route path="/cover-letter" element={<CoverLetter />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
