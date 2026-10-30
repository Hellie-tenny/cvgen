import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout'
import AdminLayout from './components/admin/AdminLayout'
import Home from './pages/Home'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Builder from './pages/Builder'
import CoverLetter from './pages/CoverLetter'
import CVBuilderGuide from './pages/CVBuilderGuide'
import CoverLetterGuide from './pages/CoverLetterGuide'
import PostJob from './pages/PostJob'
import Jobs from './pages/Jobs'
import JobDetail from './pages/JobDetail'
import AdminLogin from './pages/AdminLogin'
import AdminJobs from './pages/AdminJobs'
import AdminArticles from './pages/AdminArticles'
import AdminTemplates from './pages/AdminTemplates'
import About from './pages/About'
import Contact from './pages/Contact'
import Privacy from './pages/Privacy'
import { RequireAdmin } from './components/RequireAdmin'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*
          Public site: every page shares the same header and footer through Layout.
          - Content pages (home, blog, jobs, about…) are safe to run ads on.
          - /builder and /cover-letter are the tools themselves and stay uncluttered. Never place ads on them
            (AdSense disallows ads on screens without publisher content).
          - /cv-builder-guide and /cover-letter-guide hold the explanation of each tool: real content, so these are
            the pages that rank in search and the ones that can carry ads.
          - /post-job is the employer submission form. Listings stay pending until an admin approves them.
        */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/cover-letter" element={<CoverLetter />} />
          <Route path="/cv-builder-guide" element={<CVBuilderGuide />} />
          <Route path="/cover-letter-guide" element={<CoverLetterGuide />} />
          <Route path="/post-job" element={<PostJob />} />
        </Route>

        {/* Admin: the login page is bare; everything else sits inside AdminLayout (own nav, admin-only) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminJobs />} />
          <Route path="articles" element={<AdminArticles />} />
          <Route path="templates" element={<AdminTemplates />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
