import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'

export function LandingPage() {
  const navigate = useNavigate()
  const revealRefs = useRef([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 }
    )

    revealRefs.current.forEach(el => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const innerTimeouts = []
    const outerTimeout = setTimeout(() => {
      document.querySelectorAll('[data-testid="bar-fill"]').forEach((bar, i) => {
        const timeoutId = setTimeout(() => {
          bar.style.width = bar.dataset.w
        }, i * 100)
        innerTimeouts.push(timeoutId)
      })
    }, 500)

    return () => {
      clearTimeout(outerTimeout)
      innerTimeouts.forEach(clearTimeout)
    }
  }, [])

  return (
    <div className="bg-white">
      <Helmet>
        <title>DegreeIQ — Plan your degree, boost your CGPA</title>
        <meta name="description" content="DegreeIQ helps you visualize your degree roadmap, track CGPA, and get AI-driven recommendations to improve your GPA." />
        <meta property="og:title" content="DegreeIQ — Plan your degree, boost your CGPA" />
        <meta property="og:description" content="Visualize your roadmap, optimize course selection, and maximize your GPA with intelligent recommendations." />
        <meta property="og:image" content="/images/og-home.svg" />
        <script type="application/ld+json">{`{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://yourdomain.com/#website",
      "url": "https://yourdomain.com/",
      "name": "DegreeIQ",
      "description": "Visualize your degree roadmap, optimize course selection, and maximize your GPA with intelligent recommendations.",
      "publisher": { "@id": "https://yourdomain.com/#org" }
    },
    {
      "@type": "Organization",
      "@id": "https://yourdomain.com/#org",
      "name": "DegreeIQ",
      "url": "https://yourdomain.com/",
      "logo": "https://yourdomain.com/images/og-home.svg"
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://yourdomain.com/" }
      ]
    }
  ]
}`}</script>
      </Helmet>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-[16px] focus:top-[16px] focus:z-[200] focus:rounded-[8px] focus:bg-white focus:px-[14px] focus:py-[10px] focus:text-[14px] focus:font-medium focus:text-[#003F87] focus:shadow-lg"
      >
        Skip to content
      </a>
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-[100] h-[64px] flex items-center justify-between px-[48px] bg-white/92 backdrop-blur-[12px] border-b border-[#E2E6F0]">
        <Link to="/" className="flex items-center gap-[9px] no-underline" aria-label="DegreeIQ home">
          <div className="w-[38px] h-[38px] flex items-center justify-center flex-shrink-0">
            <img src="/images/logo/LOGO.png" alt="DegreeIQ logo" className="w-full h-full object-contain" decoding="async" fetchPriority="high" />
          </div>
          <span className="text-[1.15rem] font-bold text-[#0F2145] tracking-[-0.02em]">DegreeIQ</span>
        </Link>
        <span className="text-[0.8rem] font-medium text-[#6B7A99] tracking-[0.01em]">CS Department · COMSATS Islamabad</span>
      </nav>

      {/* HERO */}
      <main id="main-content" className="pt-[64px] min-h-screen grid grid-cols-2 items-center max-w-[1200px] mx-auto px-[48px] py-[140px_48px_80px] gap-[80px]">
        {/* LEFT */}
        <div className="hero-left">
          <div className="opacity-0 translate-y-[20px] animate-up mt-[32px]" style={{ animationDelay: '0.1s' }}>
            <h1 className="text-[clamp(2.8rem,4.5vw,4rem)] font-bold leading-[1.1] tracking-[-0.03em] text-[#0F2145] mb-[24px]">
              Plan your degree.<br />
              <em className="font-normal text-[#1A3464]">Boost your CGPA.</em>
            </h1>
          </div>

          <div className="opacity-0 translate-y-[20px] animate-up" style={{ animationDelay: '0.22s' }}>
            <p className="text-[1rem] text-[#6B7A99] leading-[1.75] max-w-[420px] mb-[40px] font-normal">
              DegreeIQ is your personal academic planning assistant. Visualize your entire degree roadmap, optimize your course selections, and get AI-driven insights to maximize your GPA.
            </p>
          </div>

          <div className="opacity-0 translate-y-[20px] animate-up" style={{ animationDelay: '0.34s' }}>
            <div className="flex items-center gap-[16px] mb-[56px]">
              <button
                onClick={() => navigate('/onboarding')}
                aria-label="Get started with DegreeIQ onboarding"
                className="inline-flex items-center gap-[8px] bg-[#0F2145] text-white font-medium px-[26px] py-[13px] rounded-[8px] border-none cursor-pointer text-[0.9rem] leading-none whitespace-nowrap transition-all hover:bg-[#1A3464] hover:translate-y-[-1px] tracking-[-0.01em]"
              >
                <span className="leading-none">Get Started</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
                  <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <span className="max-w-[210px] text-[0.78rem] leading-[1.35] text-[#6B7A99]">
                No account needed.<br />
                Your data stays in your browser.
              </span>
            </div>
          </div>

          <div className="opacity-0 translate-y-[20px] animate-up mt-[72px] pt-[24px] border-t border-[#E2E6F0]" style={{ animationDelay: '0.46s' }}>
            <div className="flex gap-[32px]">
              <div>
                <div className="text-[1.7rem] font-bold text-[#0F2145] leading-none mb-[3px] tracking-[-0.03em]">4yr</div>
                <div className="text-[0.75rem] text-[#6B7A99] font-normal">Full degree roadmap</div>
              </div>
              <div>
                <div className="text-[1.7rem] font-bold text-[#0F2145] leading-none mb-[3px] tracking-[-0.03em]">AI</div>
                <div className="text-[0.75rem] text-[#6B7A99] font-normal">Smart course advisor</div>
              </div>
              <div>
                <div className="text-[1.7rem] font-bold text-[#0F2145] leading-none mb-[3px] tracking-[-0.03em]">Free</div>
                <div className="text-[0.75rem] text-[#6B7A99] font-normal">Always, no signup</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT - DASHBOARD MOCKUP */}
        <div className="hero-right relative flex items-center justify-center opacity-0 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <div className="relative w-full max-w-[400px] ml-auto">
            {/* Shadow card behind */}
            <div className="absolute top-[14px] left-[14px] w-full h-full bg-[#E8ECF6] rounded-[20px]"></div>

            {/* Dashboard card */}
            <div className="relative z-[2] bg-white border border-[#C8D0E4] rounded-[20px] overflow-hidden shadow-lg">
              {/* Top bar - navy */}
              <div className="bg-[#0F2145] px-[22px] py-[18px] flex items-center justify-between">
                <div>
                  <div className="text-[0.65rem] font-semibold tracking-[0.08em] uppercase text-white/50 mb-[4px]">DegreeIQ Dashboard</div>
                  <div className="text-[0.92rem] font-semibold text-white tracking-[-0.01em]">BS Computer Science · Sem 6</div>
                </div>
                <div className="text-[0.65rem] font-semibold text-[#4ADE80] bg-[rgba(74,222,128,0.12)] border border-[rgba(74,222,128,0.25)] px-[10px] py-[4px] rounded-full flex items-center gap-[5px] whitespace-nowrap">
                  <span className="w-[5px] h-[5px] rounded-full bg-[#4ADE80]" style={{ animation: 'blink 2s infinite' }}></span>
                  On Track
                </div>
              </div>

              {/* Body */}
              <div className="px-[22px] py-[20px]">
                {/* CGPA + sparkline */}
                <div className="flex items-start justify-between mb-[18px]">
                  <div>
                    <div className="text-[0.68rem] text-[#6B7A99] font-medium mb-[3px] uppercase tracking-[0.06em]">Current CGPA</div>
                    <div className="text-[3rem] leading-none text-[#0F2145] font-bold tracking-[-0.04em]">
                      3.51
                      <span className="text-[1rem] text-[#6B7A99] font-normal ml-[3px]">/ 4.0</span>
                    </div>
                    <div className="mt-[6px] inline-flex items-center gap-[4px] text-[0.75rem] font-semibold text-[#16A34A] bg-[#F0FDF4] border border-[#BBF7D0] rounded-[6px] px-[8px] py-[3px]">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M5 8V2M2 4.5l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      +0.08 this semester
                    </div>
                  </div>
                  <div>
                    {/* Sparkline SVG */}
                    <svg width="100" height="52" viewBox="0 0 100 52">
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0F2145" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#0F2145" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M0 44 L16 36 L33 24 L50 28 L67 18 L84 12 L100 8 L100 52 L0 52 Z" fill="url(#areaGrad)" />
                      <polyline points="0,44 16,36 33,24 50,28 67,18 84,12 100,8" fill="none" stroke="#0F2145" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="100" cy="8" r="3.5" fill="#0F2145" />
                      <circle cx="100" cy="8" r="6" fill="#0F2145" fillOpacity="0.12" />
                    </svg>
                  </div>
                </div>

                <div className="h-[1px] bg-[#E2E6F0] mb-[16px] mx-[-22px]"></div>

                {/* Semester bars */}
                <div className="text-[0.65rem] font-semibold tracking-[0.07em] uppercase text-[#6B7A99] mb-[12px]">Semester History</div>
                <div className="flex flex-col gap-[8px] mb-[18px]">
                  {[
                    { sem: 'Sem 1', val: '2.72', w: '68%' },
                    { sem: 'Sem 2', val: '3.12', w: '78%' },
                    { sem: 'Sem 3', val: '3.41', w: '85%' },
                    { sem: 'Sem 4', val: '3.29', w: '82%' },
                    { sem: 'Sem 5', val: '3.51', w: '88%' },
                  ].map((bar, i) => (
                    <div key={i} className="grid gap-[9px]" style={{ gridTemplateColumns: '38px 1fr 34px' }}>
                      <span className="text-[0.7rem] text-[#6B7A99] font-normal">{bar.sem}</span>
                      <div className="h-[6px] bg-[#F7F8FC] rounded-[4px] overflow-hidden border border-[#E2E6F0]">
                        <div
                          className="h-full rounded-[4px] bg-gradient-to-r from-[#1A3464] to-[#0F2145] transition-all"
                          style={{ width: '0%' }}
                          data-w={bar.w}
                          data-testid="bar-fill"
                        ></div>
                      </div>
                      <span className="text-[0.7rem] font-semibold text-[#1A2A4A] text-right">{bar.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Courses footer */}
              <div className="bg-[#F7F8FC] border-t border-[#E2E6F0] px-[22px] py-[14px]">
                <div className="text-[0.65rem] font-semibold tracking-[0.07em] uppercase text-[#6B7A99] mb-[10px]">Current Courses</div>
                <div className="flex flex-wrap gap-[6px]">
                  {['OS', 'AI', 'DBMS', 'CN', 'SE', 'TOC'].map((course, i) => (
                    <span
                      key={i}
                      className={`text-[0.7rem] font-medium px-[10px] py-[4px] rounded-[5px] ${
                        i < 2 ? 'bg-[#0F2145] text-white border-[#0F2145]' : 'bg-white text-[#1A2A4A] border-[#C8D0E4]'
                      } border`}
                    >
                      {course}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating AI tip */}
            <div className="absolute bottom-[-22px] right-[-24px] z-[3] bg-[#0F2145] text-white rounded-[12px] px-[16px] py-[12px] max-w-[188px] shadow-lg border border-white/8">
              <div className="text-[0.6rem] font-bold tracking-[0.08em] uppercase opacity-45 mb-[5px] flex items-center gap-[5px]">
                ✦ AI Advisor
              </div>
              <div className="text-[0.77rem] leading-[1.5] font-normal">
                Repeating <strong>OOP</strong> could raise your CGPA by <strong>+0.12</strong> this semester.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FEATURES */}
      <section className="bg-[#F7F8FC] border-t border-[#E2E6F0] border-b px-[48px] py-[96px]">
        <div className="max-w-[1200px] mx-auto">
          <div className="opacity-0 translate-y-[20px]" ref={el => revealRefs.current.push(el)}>
            <div className="text-[0.72rem] font-semibold tracking-[0.1em] uppercase text-[#0F2145] mb-[12px]">What's inside</div>
            <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-bold text-[#0F2145] leading-[1.2] tracking-[-0.03em] mb-[56px] max-w-[520px]">
              Three tools that work<br />together for you
            </h2>
          </div>
          <div className="grid grid-cols-3" style={{ gap: '1px', backgroundColor: '#E2E6F0', border: '1px solid #E2E6F0', borderRadius: '16px', overflow: 'hidden' }} ref={el => revealRefs.current.push(el)}>
            {[
              { num: '01', title: 'CGPA Tracker', desc: 'Monitor your cumulative GPA in real-time and track your progress toward your goals across every semester.' },
              { num: '02', title: 'Degree Planner', desc: 'Visualize your entire 4-year roadmap with course prerequisites, credit hours, and sequencing built in.' },
              { num: '03', title: 'Smart Advisor', desc: 'Get AI-powered insights on which courses to repeat and exactly how to boost your CGPA most efficiently.' },
            ].map((feat, i) => (
              <div key={i} className="bg-white px-[32px] py-[36px] transition-all hover:bg-[#FAFBFF]">
                <span className="block text-[1.1rem] text-[#6B7A99] mb-[20px]">{feat.num}</span>
                <h3 className="text-[1rem] font-semibold text-[#0F2145] mb-[10px] tracking-[-0.01em]">{feat.title}</h3>
                <p className="text-[0.85rem] text-[#6B7A99] leading-[1.7]">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#E2E6F0] px-[48px] py-[24px] flex items-center justify-between">
        <div className="font-bold text-[0.9rem] text-[#0F2145] tracking-[-0.02em]">DegreeIQ</div>
        <div className="text-[0.75rem] text-[#6B7A99]">Built by Arafat Khan &amp; Muhammad Talha [FA25] · COMSATS University Islamabad · 2025</div>
      </footer>

      <style>{`
        @keyframes up {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }

        @keyframes blink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }

        .animate-up {
          animation: up 0.6s ease forwards;
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease forwards;
        }

        .bar-fill {
          transition: width 1.1s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .opacity-0 {
          opacity: 0;
        }

        .opacity-100 {
          opacity: 1;
        }

        .translate-y-\[20px\] {
          transform: translateY(20px);
        }

        .translate-y-0 {
          transform: translateY(0);
        }

        /* Stagger animation for feature cards */
        [style*="gap: 1px"] > div:nth-child(1) {
          animation: up 0.5s ease forwards;
          animation-delay: 0s;
        }

        [style*="gap: 1px"] > div:nth-child(2) {
          animation: up 0.5s ease forwards;
          animation-delay: 0.1s;
        }

        [style*="gap: 1px"] > div:nth-child(3) {
          animation: up 0.5s ease forwards;
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  )
}
