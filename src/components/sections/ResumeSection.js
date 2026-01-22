import React, { forwardRef, useRef, useMemo, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import {
  Code,
  GraduationCap,
  TrendingUp,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Download,
  Target,
} from "lucide-react";
import "../../styles/sections/ResumeSection.scss";

const StarBackground = () => {
  const stars = useMemo(() => {
    return [...Array(250)].map((_, i) => {
      const type = Math.random();
      return {
        id: i,
        class: type > 0.96 ? "hero" : type > 0.7 ? "mid" : "distant",
        size:
          type > 0.96
            ? Math.random() * 3 + 2
            : type > 0.7
              ? Math.random() * 2 + 1
              : Math.random() * 1 + 0.5,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 5,
        duration: 2 + Math.random() * 4,
        opacity: 0.2 + Math.random() * 0.8,
      };
    });
  }, []);

  return (
    <div className="cosmic-background">
      <div className="cosmic-noise"></div>
      <div className="nebula-transition-top"></div>
      <div className="nebula-layer cloud-1"></div>
      <div className="nebula-layer cloud-2"></div>
      <div className="nebula-layer cloud-3"></div>
      <div className="electric-glow spot-main"></div>
      <div className="electric-glow spot-core core-1"></div>
      <div className="electric-glow spot-core core-2"></div>
      {stars.map((star) => (
        <div
          key={star.id}
          className={`star ${star.class}`}
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            top: star.top,
            left: star.left,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
            opacity: star.opacity,
          }}
        />
      ))}
    </div>
  );
};

const Page = forwardRef((props, ref) => {
  return (
    <div
      className={`page ${props.className || ""}`}
      ref={ref}
      data-density="hard"
    >
      <div className="page-content">
        {props.children}
        <div className="page-footer">{props.number}</div>
      </div>
    </div>
  );
});

const ResumeSection = ({ id }) => {
  const bookRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = 8;

  const onFlip = (e) => {
    setCurrentPage(e.data);
  };

  const onDownloadCV = () => {
    window.open("/path-to-your-cv.pdf", "_blank");
  };

  const getBookmarkState = () => {
    if (currentPage === 0) return "is-front";
    if (currentPage === totalPages - 1) return "is-back";
    return "is-open";
  };

  const isCover = currentPage === 0 || currentPage === totalPages - 1;

  return (
    <section id={id} className="resume-section">
      <StarBackground />

      <div className="book-wrapper">
        <button
          className="nav-arrow left"
          onClick={() => bookRef.current.pageFlip().flipPrev()}
        >
          <ChevronLeft size={45} />
        </button>

        <div className="book-container">
          <div
            className={`bookmark-tab ${getBookmarkState()}`}
            onClick={!isCover ? onDownloadCV : undefined}
            style={{
              cursor: isCover ? "default" : "pointer",
              pointerEvents: isCover ? "none" : "auto",
            }}
          >
            <Download
              size={18}
              className="bookmark-icon"
              style={{ opacity: isCover ? 0 : 1 }}
            />
            <span
              className="bookmark-text"
              style={{ opacity: isCover ? 0 : 1 }}
            >
              PDF CV
            </span>
          </div>

          <HTMLFlipBook
            width={450}
            height={600}
            size="fixed"
            minWidth={450}
            maxWidth={450}
            minHeight={600}
            maxHeight={600}
            showCover={true}
            useMouseEvents={true}
            className="stellar-book"
            ref={bookRef}
            onFlip={onFlip}
            flippingTime={800}
            usePortrait={false}
            startPage={0}
            autoSize={false}
            showPageCorners={false}
            drawShadow={true}
          >
            {/* Pagina 0: Cover */}
            <Page number="" className="is-cover page-right">
              <div className="cover-content">
                <div className="corner-ornament top-left"></div>
                <div className="corner-ornament top-right"></div>
                <div className="corner-ornament bottom-left"></div>
                <div className="corner-ornament bottom-right"></div>

                <div className="cover-main-visual">
                  <div className="seal-container">
                    <Code size={40} strokeWidth={1.5} className="seal-icon" />
                  </div>
                  <div className="gold-line-v"></div>
                </div>

                <div className="cover-text-group">
                  <h1 className="book-title">Victoria</h1>
                  <div className="title-separator">
                    <span className="dot"></span>
                    <span className="line"></span>
                    <span className="dot"></span>
                  </div>
                  <h2 className="book-subtitle">Software Engineering</h2>
                  <div className="edition-badge">Edition 2026 // Portfolio</div>
                </div>
              </div>
            </Page>

            {/* Pagina 1: Professional Profile */}
            <Page number="" className="page-left">
              <div className="intro-page">
                <h3>Professional Profile</h3>
                <p className="summary-text">
                  Software Engineering student with hands-on .NET experience and
                  specialization in search-driven data systems. Combines
                  academic achievement with production experience in C# and
                  OpenSearch development.
                </p>
                <div className="icon-separator">• • •</div>
                <div className="career-highlight">
                  <h4>
                    <Target size={16} /> Career Direction
                  </h4>
                  <p>
                    Pursuing software engineering opportunities in Japan (2027
                    target), supported by ongoing Japanese language studies (N4
                    level).
                  </p>
                </div>
              </div>
            </Page>

            {/* Pagina 2: Associate Degree */}
            <Page number="1" className="page-right">
              <div className="timeline-page">
                <h2 className="page-header">
                  <GraduationCap size={18} /> Associate Degree
                </h2>
                <div className="timeline-content">
                  <div className="year">2023 - 2025</div>
                  <h3>Programming (Graduaat)</h3>
                  <p className="location">
                    Howest University of Applied Sciences
                  </p>

                  <div className="immersion-tag">
                    <strong>Technical Immersion:</strong> A high-intensity
                    program focused on production-ready development.
                  </div>

                  <ul className="achievement-list">
                    <li>
                      <strong>Graduated with High Distinction</strong>
                    </li>
                    <li>
                      <strong>Development:</strong> C# & .NET backend logic
                      integrated with
                      <strong> HTML5, CSS3, and JavaScript</strong> frontend.
                    </li>
                    <li>
                      <strong>Infrastructure:</strong> Database design (MS SQL /
                      T-SQL) and <strong>Docker</strong> containerization.
                    </li>
                    <li>
                      <strong>Methodology:</strong> Professional workflows using
                      Agile/Scrum, Git, and GitHub.
                    </li>
                  </ul>
                </div>
              </div>
            </Page>

            {/* Pagina 3: Bachelor's Degree */}
            <Page number="2" className="page-left">
              <div className="timeline-page">
                <h2 className="page-header">
                  <TrendingUp size={18} /> Bachelor's Degree
                </h2>
                <div className="timeline-content">
                  <div className="year">2025 - 2027</div>
                  <h3>Applied Informatics (Bachelor)</h3>
                  <p className="location">
                    Software Engineering Specialization
                  </p>

                  <div className="accelerated-badge">
                    <strong>Accelerated Track:</strong> Direct Year 2 entry
                    based on prior Associate Degree qualifications.
                  </div>

                  <ul className="current-focus-compact">
                    <li>
                      <strong>Architecture:</strong> DDD, Design Patterns &
                      Enterprise Systems
                    </li>
                    <li>
                      <strong>Engineering:</strong> Data Structures, Algorithms
                      & QA
                    </li>
                    <li>
                      <strong>Cloud & .NET:</strong> Advanced ecosystems &
                      Cloud-native deployment
                    </li>
                    <li>
                      <strong>Design:</strong> UX Engineering & Information
                      Architecture
                    </li>
                  </ul>
                </div>
              </div>
            </Page>

            {/* Pagina 4: Merged Experience */}
            <Page number="3" className="page-right">
              <div className="internship-page">
                <h2 className="page-header">
                  <Briefcase size={18} /> Professional Experience
                </h2>

                <div className="experience-card">
                  <div className="exp-header">
                    <p className="role">Software Engineering Intern</p>
                    <p className="company">
                      Vanden Broele • <span className="date">2025</span>
                    </p>
                  </div>

                  <div className="project-brief">
                    <strong>Project:</strong> Search-driven Data Retrieval
                    System
                  </div>

                  <ul className="impact-list-clean">
                    <li>
                      <strong>Performance:</strong> Achieved sub-second response
                      times on large-scale datasets using OpenSearch
                      optimization.
                    </li>
                    <li>
                      <strong>DevOps:</strong> Containerized services with
                      Docker for production-ready deployment.
                    </li>
                    <li>
                      <strong>Full-stack:</strong> Built RESTful APIs in .NET
                      Core with a modern TypeScript & Tailwind CSS frontend.
                    </li>
                  </ul>

                  <div className="tech-tags-resume">
                    <span>.NET Core</span> <span>C#</span>{" "}
                    <span>OpenSearch</span>
                    <span>Docker</span> <span>TypeScript</span>{" "}
                    <span>Tailwind</span>
                  </div>
                </div>
              </div>
            </Page>

            {/* Pagina 5: Career Path */}
            <Page number="4" className="page-left">
              <div className="future-page">
                <h2 className="page-header">
                  <Target size={18} /> Career Vision
                </h2>
                <div className="goal-container">
                  <div className="goal-section">
                    <h4>Primary Target: Japan (2027)</h4>
                    <p>
                      Securing a Software Engineering internship in the
                      Tokyo/Saitama region.
                    </p>
                  </div>

                  <div className="goal-section">
                    <h4>Strategic Readiness</h4>
                    <ul className="goal-list-compact">
                      <li>
                        <strong>Japanese:</strong> Currently JLPT N4 level
                        (Active study).
                      </li>
                      <li>
                        <strong>Technical:</strong> Expanding Full-stack
                        expertise.
                      </li>
                      <li>
                        <strong>Network:</strong> Targeting Japanese firms in
                        both Japan and the Benelux.
                      </li>
                    </ul>
                  </div>

                  <div className="divider-small"></div>

                  <p className="status-note">
                    <strong>Current Status:</strong> Actively building the
                    technical and linguistic bridge for international transit.
                  </p>
                </div>
              </div>
            </Page>

            {/* Pagina 6: Closing Page */}
            <Page number="" className="page-right">
              <div className="page-inner-back">
                <div className="closing-content">
                  <Code size={40} className="faded-icon" />
                  <h3>Thank you for your time</h3>

                  <div className="divider-small"></div>

                  <p className="sub-text">
                    If you're looking for a dedicated developer with{" "}
                    <strong>.NET expertise</strong>
                    and <strong>international project experience</strong>, I'd
                    welcome a conversation.
                  </p>

                  <button
                    className="download-btn-styled"
                    onClick={onDownloadCV}
                  >
                    <Download size={16} /> Get PDF Version
                  </button>

                  <p className="scroll-hint">Discover my socials below</p>
                </div>
              </div>
            </Page>

            {/* Pagina 7: Back Cover */}
            <Page number="" className="is-cover page-left">
              <div className="back-cover-outside">
                <div className="back-logo">
                  <Code size={50} />
                </div>
                <div className="back-footer-text">
                  <p>© 2026 Victoria Portfolio</p>
                  <p>Built with React & Framer Motion</p>
                </div>
              </div>
            </Page>
          </HTMLFlipBook>
        </div>

        <button
          className="nav-arrow right"
          onClick={() => bookRef.current.pageFlip().flipNext()}
        >
          <ChevronRight size={45} />
        </button>
      </div>
    </section>
  );
};

export default ResumeSection;