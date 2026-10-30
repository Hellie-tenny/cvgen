import { Helmet } from 'react-helmet-async'
import { Canonical } from '../components/Canonical'
import { CVBuilder } from '../components/cv-builder/cv-builder'
import { TemplatesProvider } from '../components/cv-builder/templates-context'

export default function Builder() {
  return (
    <div>
      {/*
        This page is the tool and nothing else. The explanation lives at /cv-builder-guide, which is where
        search traffic and ads belong. Never place ad units on this page.
      */}
      <Helmet>
        <title>Free CV Builder — Create a Professional CV Online | Etiquette CV</title>
        <meta
          name="description"
          content="Build a professional CV online for free. Choose a template, fill in your details, preview it live and download a PDF. Works on your phone, no sign-up needed."
        />
      </Helmet>
      <Canonical path="/builder" />
      {/* Loads the admin-made templates, so they appear in the template step and in the preview/PDF */}
      <TemplatesProvider>
        <CVBuilder />
      </TemplatesProvider>
    </div>
  )
}
