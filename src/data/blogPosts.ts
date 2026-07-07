export type BlogPost = {
  slug: string
  title: string
  description: string
  date: string
  readTime: string
  content: string[] // array of paragraphs
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'how-to-write-a-cv-that-gets-interviews',
    title: 'How to Write a CV That Actually Gets You Interviews',
    description:
      'Most CVs get rejected in under ten seconds. Here is what actually matters to a recruiter skimming your CV, and how to structure yours around it.',
    date: '2026-06-15',
    readTime: '6 min read',
    content: [
      "Recruiters spend an average of six to eight seconds on a first pass of a CV. That sounds harsh, but it explains almost everything about why some CVs get callbacks and others disappear into a pile. The people reading your CV are not reading it the way you wrote it, top to bottom, sentence by sentence. They are scanning it, looking for a handful of signals that tell them whether to keep reading. Your job is not to write a complete life story. Your job is to make those six seconds work in your favor.",
      "The first thing a recruiter looks for is fit. Does your most recent job title look like something that belongs in this role? This is why your most recent position needs to sit at the very top of your experience section, with the job title bolded and immediately visible, not buried under a paragraph of company history. If your last job title does not obviously match the role you are applying for, use the line directly under it to bridge the gap in plain language, rather than hoping the reader connects the dots themselves.",
      "The second thing they look for is impact, not duties. A huge number of CVs read like a job description: 'Responsible for managing client accounts and preparing reports.' That tells a recruiter what you were assigned, not what you actually did with it. Compare that to: 'Managed a portfolio of 40 client accounts, reducing churn by 18% over one year through a new onboarding process.' The second version answers the question every recruiter is actually asking, which is: what changed because you were there? Wherever you can, attach a number to an achievement, even an estimated one. Recruiters trust specificity far more than adjectives like 'excellent' or 'hardworking.'",
      "Third, keep the structure predictable. Unusual CV layouts, heavy graphics, or creative fonts might feel like they help you stand out, but they often work against you, especially once your CV goes through an applicant tracking system that parses text automatically. A clean, single-column layout with clear section headings (Experience, Education, Skills) parses correctly and reads quickly for a human skimming on a phone or a tired reviewer looking at their fortieth CV of the day. Standing out should come from what you achieved, not from how unusual your CV looks.",
      "Finally, tailor it. The single highest-leverage change most people can make is trimming their CV down to what is relevant for the specific role, rather than sending the same generic document everywhere. You do not need to rewrite the whole thing for every application, but swapping your top three bullet points to match the language and priorities in the job posting takes a few minutes and meaningfully changes how relevant your CV looks on that first scan.",
    ],
  },
  {
    slug: 'cv-vs-resume-difference',
    title: "CV vs Resume: What's Actually the Difference (and Does It Matter?)",
    description:
      "The terms get used interchangeably online, but the expectations behind them differ by country and by industry. Here's what to actually send.",
    date: '2026-06-22',
    readTime: '4 min read',
    content: [
      "If you have searched for CV advice online, you have probably noticed that 'CV' and 'resume' get used as if they mean the same thing, and then, in the same breath, get described as completely different documents. Both things are true, depending on where you are and who you are applying to, which is exactly why it is confusing.",
      "In the United States and Canada, a resume is the standard document for almost all job applications: one to two pages, focused entirely on relevant work experience, skills, and achievements, tailored per application. A CV, in that same context, refers specifically to an academic curriculum vitae, used mainly for academic positions, research roles, grants, or fellowships. It is comprehensive rather than tailored: it lists every publication, every conference presentation, every grant received, and it can run to many pages because completeness, not brevity, is the point.",
      "Outside North America, in the UK, most of Europe, and much of Africa and Asia including Malawi, 'CV' is simply the standard term for what Americans call a resume. It is the one-to-two page, tailored, achievement-focused document used for ordinary job applications, not the long-form academic document. There is no separate 'resume' term in everyday use in these regions; CV covers it.",
      "So the practical answer is: match the term and the format to your audience. If you are applying anywhere outside North America, or to a non-academic role in North America, a concise, tailored, one-to-two page document is what is expected, regardless of whether you call it a CV or a resume. If you are applying to an academic or research post in the US or Canada specifically, that is the one case where a genuinely long, comprehensive CV listing every publication is expected and appropriate.",
      "For the overwhelming majority of job seekers, the safe move is the same one either way: keep it short, keep it tailored to the specific role, and lead with achievements rather than a list of duties.",
    ],
  },
  {
    slug: 'common-cv-mistakes',
    title: 'Common CV Mistakes That Get Applications Rejected',
    description:
      'Some CV mistakes are obvious once pointed out, but they show up constantly. A quick checklist before you send yours.',
    date: '2026-06-29',
    readTime: '5 min read',
    content: [
      "A large share of CV rejections have nothing to do with a candidate's actual qualifications. They come down to a handful of avoidable mistakes that quietly signal carelessness to the person reading. None of these take long to fix, but they are easy to miss when you have read your own CV a dozen times and stopped seeing it clearly.",
      "The most common one is an outdated or mismatched contact section. A CV listing an old phone number, a college email address you no longer check, or a LinkedIn URL that leads to a dead profile actively costs interviews, because a recruiter who cannot reach you simply moves to the next candidate rather than chasing you down. Before every application round, it is worth a two-minute check that every link and number on your CV is current.",
      "The second is generic, duty-based bullet points instead of achievement-based ones. 'Handled customer inquiries' describes a responsibility that thousands of other applicants also had. 'Resolved an average of 60 customer inquiries a day with a 95% satisfaction rating' describes a specific person who was good at their job. If a bullet point could be copy-pasted onto anyone else's CV in the same role, it is not doing enough work for you specifically.",
      "The third mistake is inconsistent formatting: mixed date formats, some job titles bolded and others not, uneven spacing between sections. On their own these seem trivial, but a reader processes inconsistency as a lack of attention to detail, and attention to detail is exactly the trait many roles are screening for. Running through the finished document once, purely checking formatting rather than content, catches most of these.",
      "The fourth is a CV that is too long because it tries to include everything from a fifteen-year career instead of what is relevant now. Older or less relevant roles can be condensed to a single line, or dropped, so the space goes to your most recent and most relevant experience instead.",
      "Finally, skipping the proofread. Spelling and grammar errors are still one of the fastest ways to get a CV set aside, particularly for roles where written communication matters. Reading it aloud, or asking someone else to read it, catches mistakes that get invisible to you after the tenth read-through.",
    ],
  },
]
