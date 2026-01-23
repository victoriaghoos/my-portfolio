import React, { forwardRef, useRef, useMemo, useState, useEffect } from "react";
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
  User,
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
  const [isFlipping, setIsFlipping] = useState(false);
  const [nextPageDirection, setNextPageDirection] = useState(null);
  const [flipStartData, setFlipStartData] = useState(null);
  const totalPages = 8;

  const onFlip = (e) => {
    setCurrentPage(e.data);
    setIsFlipping(false);
    setNextPageDirection(null);
    setFlipStartData(null);
  };

  const onFlipStart = (e) => {
    setIsFlipping(true);
    setFlipStartData(e.data);
    
    // Simpelere logica voor direction bepaling
    if (e.data === 0) {
      // Starten vanaf front cover = forward flip
      setNextPageDirection('next');
    } else if (e.data === totalPages - 2) {
      // Van pagina 6 naar back cover = forward flip
      setNextPageDirection('next');
    } else if (e.data === totalPages - 1) {
      // Van back cover naar pagina 6 = backward flip
      setNextPageDirection('prev');
    } else if (e.data === 1 && currentPage === 0) {
      // Van pagina 1 naar front cover = backward flip
      setNextPageDirection('prev');
    } else {
      // Standaard logica voor andere pagina's
      const direction = e.data > currentPage ? 'next' : 'prev';
      setNextPageDirection(direction);
    }
  };

  const onDownloadCV = () => {
    window.open("/path-to-your-cv.pdf", "_blank");
  };

  // Get bookmark state with immediate updates during flips
  const getBookmarkState = () => {
    // Als we aan het flippen zijn, gebruik dan voorspelde state
    if (isFlipping && nextPageDirection && flipStartData !== null) {
      let predictedPage;
      
      if (nextPageDirection === 'next') {
        predictedPage = flipStartData + 1;
      } else {
        predictedPage = flipStartData - 1;
      }
      
      // Clamp predicted page within bounds
      predictedPage = Math.max(0, Math.min(totalPages - 1, predictedPage));
      
      if (predictedPage === 0) return "is-front";
      if (predictedPage === totalPages - 1) return "is-back";
      return "is-open";
    }
    
    // Normale state wanneer niet aan het flippen
    if (currentPage === 0) return "is-front";
    if (currentPage === totalPages - 1) return "is-back";
    return "is-open";
  };

  // Get interactive states with immediate updates during flips
  const getInteractiveState = () => {
    if (isFlipping && nextPageDirection && flipStartData !== null) {
      let predictedPage;
      
      if (nextPageDirection === 'next') {
        predictedPage = flipStartData + 1;
      } else {
        predictedPage = flipStartData - 1;
      }
      
      // Clamp predicted page within bounds
      predictedPage = Math.max(0, Math.min(totalPages - 1, predictedPage));
      
      const isPredictedFrontCover = predictedPage === 0;
      const isPredictedBackCover = predictedPage === totalPages - 1;
      
      return {
        isFrontCover: isPredictedFrontCover,
        isBackCover: isPredictedBackCover,
      };
    }
    
    return {
      isFrontCover: currentPage === 0,
      isBackCover: currentPage === totalPages - 1,
    };
  };

  const { isFrontCover, isBackCover } = getInteractiveState();
  const bookmarkState = getBookmarkState();

  const handlePrevClick = () => {
    if (!isFrontCover) {
      setIsFlipping(true);
      setNextPageDirection('prev');
      setFlipStartData(currentPage);
      bookRef.current.pageFlip().flipPrev();
    }
  };

  const handleNextClick = () => {
    if (!isBackCover) {
      setIsFlipping(true);
      setNextPageDirection('next');
      setFlipStartData(currentPage);
      bookRef.current.pageFlip().flipNext();
    }
  };

  // Voeg event listeners toe voor mouse down op pages (voor drag flips)
  useEffect(() => {
    const bookElement = document.querySelector('.stellar-book');
    if (!bookElement) return;

    const handlePageMouseDown = (e) => {
      // Check of we op een page klikken (niet op de bookmark of arrows)
      const pageElement = e.target.closest('.page');
      if (pageElement) {
        const pageIndex = Array.from(bookElement.querySelectorAll('.page')).indexOf(pageElement);
        if (pageIndex !== -1) {
          setIsFlipping(true);
          setFlipStartData(pageIndex);
          
          // Bepaal direction op basis van welke pagina we zijn
          if (pageIndex === 0) {
            setNextPageDirection('next');
          } else if (pageIndex === totalPages - 2) {
            setNextPageDirection('next');
          } else if (pageIndex === totalPages - 1) {
            setNextPageDirection('prev');
          } else if (pageIndex === 1 && currentPage === 0) {
            setNextPageDirection('prev');
          }
        }
      }
    };

    bookElement.addEventListener('mousedown', handlePageMouseDown);
    
    return () => {
      bookElement.removeEventListener('mousedown', handlePageMouseDown);
    };
  }, [currentPage]);

  return (
    <section id={id} className="resume-section">
      <StarBackground />

      <div className="book-wrapper">
        <button
          className={`nav-arrow left ${isFrontCover ? 'disabled' : ''}`}
          onClick={handlePrevClick}
          disabled={isFrontCover}
          style={{
            cursor: isFrontCover ? 'default' : 'pointer',
            pointerEvents: isFrontCover ? 'none' : 'auto',
            opacity: isFrontCover ? 0.3 : 1,
          }}
        >
          <ChevronLeft size={45} />
        </button>

        <div className="book-container">
          <div
            className={`bookmark-tab ${bookmarkState}`}
            onClick={!isFrontCover && !isBackCover ? onDownloadCV : undefined}
            style={{
              cursor: isFrontCover || isBackCover ? "default" : "pointer",
              pointerEvents: isFrontCover || isBackCover ? "none" : "auto",
            }}
          >
            <Download
              size={18}
              className="bookmark-icon"
              style={{ opacity: isFrontCover || isBackCover ? 0 : 1 }}
            />
            <span
              className="bookmark-text"
              style={{ opacity: isFrontCover || isBackCover ? 0 : 1 }}
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
            onFlipStart={onFlipStart}
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

            {/* Page 1: Professional Profile */}
            <Page number="1" className="page-left">
              <div className="page-inner-centered">
                <h2 className="page-header">
                  <User size={18} /> Professional Profile
                </h2>
                <div className="section-content">
                  <p className="summary-text">
                    Software Engineering student with hands-on .NET experience
                    and specialization in search-driven data systems. Combines
                    academic achievement with production experience in C# and
                    OpenSearch development.
                  </p>
                </div>
              </div>
            </Page>

            {/* Page 2: Associate Degree */}
            <Page number="2" className="page-right">
              <div className="page-inner">
                <h2 className="page-header">
                  <GraduationCap size={18} /> Associate Degree
                </h2>
                <div className="section-content">
                  <span className="year-label">2023 - 2025</span>
                  <h3>Programming (Graduaat)</h3>
                  <p className="subtitle-text">
                    Howest University of Applied Sciences
                  </p>

                  {/* MOVED AND STYLED AS A HIGHLIGHT */}
                  <p className="distinction-badge">
                    Graduated with High Distinction
                  </p>

                  {/* REFORMATTED FOR SCANNABILITY */}
                  <ul className="achievement-list">
                    <li>
                      <strong>Development:</strong> C# & .NET, HTML5, CSS3,
                      JavaScript
                    </li>
                    <li>
                      <strong>Infrastructure:</strong> MS SQL / T-SQL, Docker
                      Containerization
                    </li>
                    <li>
                      <strong>Methodology:</strong> Agile/Scrum, Git, GitHub
                    </li>
                  </ul>
                </div>
              </div>
            </Page>

            {/* Page 3: Bachelor's Degree (Page 2) */}
            <Page number="3" className="page-left">
              <div className="page-inner">
                <h2 className="page-header">
                  <TrendingUp size={22} /> Bachelor's Degree
                </h2>
                <div className="section-content">
                  <span className="year-label">2025 - 2027</span>
                  <h3>Applied Informatics (Bachelor)</h3>
                  <p className="subtitle-text">
                    Software Engineering Specialization
                  </p>

                  <div className="highlight-box">
                    <strong>Accelerated Track:</strong> Direct Year 2 entry
                    based on prior Associate Degree qualifications.
                  </div>

                  <ul>
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
                  </ul>
                </div>
              </div>
            </Page>

            {/* Page 4: Professional Experience (Page 3) */}
            <Page number="4" className="page-right">
              <div className="page-inner">
                <h2 className="page-header">
                  <Briefcase size={22} /> Professional Experience
                </h2>
                <div className="section-content">
                  <span className="year-label">INTERNSHIP • 2025</span>
                  <h3>Vanden Broele</h3>
                  <p className="subtitle-text">
                    Search-driven Data Retrieval System
                  </p>

                  <ul>
                    <li>
                      Achieved sub-second response times using{" "}
                      <strong>OpenSearch</strong>.
                    </li>
                    <li>
                      Containerized services with <strong>Docker</strong> for
                      production.
                    </li>
                  </ul>

                  <div className="tech-tags-container">
                    <span>.NET CORE</span> <span>C#</span>{" "}
                    <span>OPENSEARCH</span> <span>DOCKER</span>{" "}
                    <span>TYPESCRIPT</span>
                  </div>
                </div>
              </div>
            </Page>

            {/* Page 5: Career Vision (Page 4) */}
            <Page number="5" className="page-left">
              <div className="page-inner">
                <h2 className="page-header">
                  <Target size={18} /> Career Vision
                </h2>
                <div className="section-content">
                  <div className="goal-section">
                    <h4 className="subtitle-gold">
                      Primary Target: Japan (2027)
                    </h4>
                    <p>
                      Securing a Software Engineering internship in the
                      Tokyo/Saitama region.
                    </p>
                  </div>

                  <div className="goal-section" style={{ marginTop: "20px" }}>
                    <h4 className="subtitle-gold">Strategic Readiness</h4>
                    <ul className="goal-list-compact">
                      <li>
                        <strong>Japanese:</strong> Currently JLPT N4 level
                        (Active study).
                      </li>
                      <li>
                        <strong>Technical:</strong> Expanding Full-stack
                        expertise.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </Page>

            {/* Page 6: Closing Page */}
            <Page number="6" className="page-right">
              <div className="page-inner-back">
                <div className="closing-content">
                  <Code size={40} className="faded-icon" />
                  <h3>Thank you for your time</h3>
                  <div className="divider-small"></div>
                  <p className="sub-text">
                    If you're looking for a dedicated developer with{" "}
                    <strong>.NET expertise</strong> and{" "}
                    <strong>international project experience</strong>, I'd
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
            <Page number="" className="is-cover is-back-cover page-left">
              <div className="cover-content">
                <div className="corner-ornament top-left"></div>
                <div className="corner-ornament top-right"></div>
                <div className="corner-ornament bottom-left"></div>
                <div className="corner-ornament bottom-right"></div>

                <div className="back-cover-content">
                  <div className="back-seal">
                    <Code
                      size={55}
                      strokeWidth={1}
                      className="back-logo-icon"
                    />
                  </div>

                  <div className="back-text-group">
                    <div className="title-separator small">
                      <span className="line"></span>
                      <span className="dot"></span>
                      <span className="line"></span>
                    </div>

                    <p className="copyright">© 2026 Victoria Portfolio</p>

                    <div className="tech-badge">
                      Built with React & Framer Motion
                    </div>
                  </div>
                </div>
              </div>
            </Page>
          </HTMLFlipBook>
        </div>

        <button
          className={`nav-arrow right ${isBackCover ? 'disabled' : ''}`}
          onClick={handleNextClick}
          disabled={isBackCover}
          style={{
            cursor: isBackCover ? 'default' : 'pointer',
            pointerEvents: isBackCover ? 'none' : 'auto',
            opacity: isBackCover ? 0.3 : 1,
          }}
        >
          <ChevronRight size={45} />
        </button>
      </div>
    </section>
  );
};

export default ResumeSection;