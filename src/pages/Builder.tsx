import { Helmet } from 'react-helmet-async'
import Header from '../components/Header'
import { CVBuilder } from '../components/cv-builder/cv-builder'

export default function Builder() {
  return (
    <div>
      {/*
        This is the tool itself — a utility screen (form + live preview),
        not a content page. Keep it noindex and never place ad units here:
        AdSense explicitly disallows ads on screens without publisher content.
      */}
      <Helmet>
        <title>CV Builder — Etiquette CV</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <Header />
      <CVBuilder />
    </div>
  )
}
