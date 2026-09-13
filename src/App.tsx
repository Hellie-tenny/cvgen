import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout'
import Home from './pages/Home'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Builder from './pages/Builder'
import CoverLetter from './pages/CoverLetter'
import PostJob from './pages/PostJob'
import Jobs from './pages/Jobs'
import JobDetail from './pages/JobDetail'
import AdminLogin from './pages/AdminLogin'
import AdminJobs from './pages/AdminJobs'
import { RequireAdmin } from './components/RequireAdmin'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Content pages — safe to run ads on these */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
        </Route>

        {/* Builder — bare utility tool, no ads, noindex, no footer */}
        <Route path="/builder" element={<Builder />} />

        {/*
          Cover letter tool — kept noindex for now until the /builder AdSense
          review has cleared and the site's had time to settle. Revisit
          un-noindexing later. Renders its own Header/Footer directly rather
          than nesting under Layout, since its content structure differs
          slightly from Home/Blog.
        */}
        <Route path="/cover-letter" element={<CoverLetter />} />

        {/*
          Recruitment portal, Phase 1: employer submission form only.
          Listings are pending until approved (Phase 2 admin review), so
          this page has nothing to index yet.
        */}
        <Route path="/post-job" element={<PostJob />} />

        {/* Recruitment portal, Phase 2: admin-only review dashboard */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminJobs />
            </RequireAdmin>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
