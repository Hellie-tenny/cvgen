import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import { CVBuilder } from './components/cv-builder/cv-builder'
import Landing from './landing/Landing'

function App() {
  const [showApp, setShowApp] = useState(false)

  if (!showApp) {
    return <Landing onEnter={() => setShowApp(true)} />
  }

  return (
    <div>
      <Header />
      <CVBuilder />
    </div>
  )
}

export default App
