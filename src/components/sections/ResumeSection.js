import React, { forwardRef, useRef, useMemo, useState, useEffect } from "react";
import HTMLFlipBook from "react-pageflip";
import { useTranslation, Trans } from 'react-i18next';
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
  ArrowDown
} from "lucide-react";
import { motion } from "framer-motion";
import "../../styles/sections/ResumeSection.scss";
import resumePDF from "../../assets/files/Resume2026.pdf";

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
  const { t } = useTranslation();

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
    window.open(resumePDF, "_blank");
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

  const scrollToSocials = () => {
    const socialsSection = document.getElementById("socials-section");
    if (socialsSection) {
      socialsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: "easeOut",
        when: "beforeChildren", 
        staggerChildren: 0.2
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
  };

  return (
    <section id={id} className="resume-section">
      <StarBackground />

      <motion.div 
        className="book-wrapper"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
      >
        <motion.button
          variants={itemVariants}
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
        </motion.button>

        <motion.div className="book-container" variants={itemVariants}>
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
              {t('resume')}
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
                  <h2 className="book-subtitle">{t('resume_content.cover.subtitle')}</h2>
                  <div className="edition-badge">{t('resume_content.cover.edition')}</div>
                </div>
              </div>
            </Page>

            {/* Page 1: Professional Profile */}
            <Page number="1" className="page-left">
              <div className="page-inner-centered">
                <h2 className="page-header"><User size={18} /> {t('resume_content.p1.title')}</h2>
                <div className="section-content">
                  <p className="summary-text">{t('resume_content.p1.text')}</p>
                </div>
              </div>
            </Page>

            {/* Page 2: Associate Degree */}
            <Page number="2" className="page-right">
              <div className="page-inner">
                <h2 className="page-header"><GraduationCap size={18} /> {t('resume_content.p2.title')}</h2>
                <div className="section-content">
                  <span className="year-label">2023 - 2025</span>
                  <h3>{t('resume_content.p2.program')}</h3>
                  <p className="subtitle-text">{t('resume_content.p2.school')}</p>
                  <p className="distinction-badge">{t('resume_content.p2.distinction')}</p>
                  <ul className="achievement-list">
                    <li>
                      <Trans i18nKey="resume_content.p2.list_dev"><strong>Development:</strong></Trans>
                    </li>
                    <li>
                      <Trans i18nKey="resume_content.p2.list_infra"><strong>Infrastructure:</strong></Trans>
                    </li>
                    <li>
                      <Trans i18nKey="resume_content.p2.list_method"><strong>Methodology:</strong></Trans>
                    </li>
                  </ul>
                </div>
              </div>
            </Page>

            {/* Page 3: Bachelor's Degree (Page 2) */}
            <Page number="3" className="page-left">
              <div className="page-inner">
                <h2 className="page-header"><TrendingUp size={22} /> {t('resume_content.p3.title')}</h2>
                <div className="section-content">
                  <span className="year-label">2025 - 2027</span>
                  <h3>{t('resume_content.p3.program')}</h3>
                  <p className="subtitle-text">{t('resume_content.p3.specialization')}</p>
                  <div className="highlight-box">
                    <Trans i18nKey="resume_content.p3.track_info"><strong>Accelerated Track:</strong></Trans>
                  </div>
                  <ul>
                    <li><Trans i18nKey="resume_content.p3.list_arch"><strong>Architecture:</strong></Trans></li>
                    <li><Trans i18nKey="resume_content.p3.list_eng"><strong>Engineering:</strong></Trans></li>
                    <li><Trans i18nKey="resume_content.p3.list_cloud"><strong>Cloud & .NET:</strong></Trans></li>
                  </ul>
                </div>
              </div>
            </Page>


            {/* Page 4: Professional Experience (Page 3) */}
            <Page number="4" className="page-right">
              <div className="page-inner">
                <h2 className="page-header"><Briefcase size={22} /> {t('resume_content.p4.title')}</h2>
                <div className="section-content">
                  <span className="year-label">{t('resume_content.p4.context')}</span>
                  <h3>Vanden Broele</h3>
                  <p className="subtitle-text">{t('resume_content.p4.role')}</p>
                  <ul>
                    <li><Trans i18nKey="resume_content.p4.bullet_1"><strong>OpenSearch</strong></Trans></li>
                    <li><Trans i18nKey="resume_content.p4.bullet_2"><strong>Docker</strong></Trans></li>
                  </ul>
                  <div className="tech-tags-container">
                    <span>.NET CORE</span> <span>C#</span> <span>OPENSEARCH</span> <span>DOCKER</span> <span>TYPESCRIPT</span>
                  </div>
                </div>
              </div>
            </Page>

            {/* Page 5: Career Vision (Page 4) */}
            <Page number="5" className="page-left">
              <div className="page-inner">
                <h2 className="page-header"><Target size={18} /> {t('resume_content.p5.title')}</h2>
                <div className="section-content">
                  <div className="goal-section">
                    <h4 className="subtitle-gold">{t('resume_content.p5.target_title')}</h4>
                    <p>{t('resume_content.p5.target_text')}</p>
                  </div>
                  <div className="goal-section" style={{ marginTop: "20px" }}>
                    <h4 className="subtitle-gold">{t('resume_content.p5.readiness_title')}</h4>
                    <ul className="goal-list-compact">
                      <li><Trans i18nKey="resume_content.p5.list_jp"><strong>Japanese:</strong></Trans></li>
                      <li><Trans i18nKey="resume_content.p5.list_tech"><strong>Technical:</strong></Trans></li>
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
                  <h3>{t('resume_content.p6.title')}</h3>
                  <div className="divider-small"></div>
                  <p className="sub-text">
                    <Trans i18nKey="resume_content.p6.text">
                      If you're looking for a dedicated developer with <strong>.NET expertise</strong> and <strong>international project experience</strong>, I'd welcome a conversation.
                    </Trans>
                  </p>
                  <button className="download-btn-styled" onClick={onDownloadCV}>
                    <Download size={16} /> {t('resume_content.p6.btn_pdf')}
                  </button>
                  <p 
                    className="scroll-hint" 
                    onClick={scrollToSocials}
                    style={{ 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      marginTop: '15px' 
                    }}
                  >
                    {t('resume_content.p6.scroll_hint')} 
                    <ArrowDown size={18} />
                  </p>
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
                  <div className="back-seal"><Code size={55} strokeWidth={1} className="back-logo-icon" /></div>
                  <div className="back-text-group">
                    <div className="title-separator small"><span className="line"></span><span className="dot"></span><span className="line"></span></div>
                    <p className="copyright">© 2026 Victoria Portfolio</p>
                    <div className="tech-badge">{t('resume_content.cover.built_with')}</div>
                  </div>
                </div>
              </div>
            </Page>
          </HTMLFlipBook>
        </motion.div>

        <motion.button 
          variants={itemVariants}
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
        </motion.button>
      </motion.div>
    </section>
  );
};

export default ResumeSection;