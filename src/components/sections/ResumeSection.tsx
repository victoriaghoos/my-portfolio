import {
  forwardRef,
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import HTMLFlipBook from 'react-pageflip';
import { useTranslation, Trans } from 'react-i18next';
import { useReducedMotion, type Variants } from 'framer-motion';
import useCanvasAnimationLoop, { type CanvasDrawArgs } from '../../hooks/useCanvasAnimationLoop';
import { Code, ChevronLeft, ChevronRight, Download, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';
// The book's typefaces, loaded with this section only
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import '@fontsource/cormorant-garamond/700.css';
import '@fontsource/cinzel/700.css';
import '@fontsource/cinzel-decorative/700.css';
import '../../styles/sections/ResumeSection.scss';
import { InkDivider, WaxSeal } from './BookOrnaments';
import resumePDF from '../../assets/files/Resume2026.pdf';
import { scrollToSection } from '../../utils/scrollToSection';

const ResumeStarsCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const stars = useMemo(
    () =>
      [...Array(500)].map((_, i) => {
        const type = Math.random();
        const starType = type > 0.99 ? 'hero' : type > 0.75 ? 'mid' : 'distant';
        return {
          id: i,
          type: starType,
          x: Math.random(),
          y: Math.random(),
          radius:
            starType === 'hero'
              ? Math.random() * 1.1 + 1.4
              : starType === 'mid'
                ? Math.random() * 0.3 + 0.45
                : Math.random() * 0.22 + 0.28,
          alpha:
            starType === 'hero'
              ? Math.random() * 0.4 + 0.6
              : starType === 'mid'
                ? Math.random() * 0.18 + 0.45
                : Math.random() * 0.12 + 0.25,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.002 + 0.001,
        };
      }),
    [],
  );

  const drawStars = useCallback(
    ({ ctx, width, height, timestamp, isStatic }: CanvasDrawArgs) => {
      ctx.clearRect(0, 0, width, height);

      stars.forEach((star) => {
        const twinkle =
          reduceMotion || isStatic
            ? 1
            : 0.75 + Math.sin(timestamp * star.speed + star.phase) * 0.14;
        const alpha = Math.min(1, Math.max(0, star.alpha * twinkle));

        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(star.x * width, star.y * height, star.radius, 0, Math.PI * 2);
        ctx.fill();

        if (star.type === 'hero') {
          ctx.strokeStyle = 'rgba(255,255,255,0.35)';
          ctx.lineWidth = 1;
          const x = star.x * width;
          const y = star.y * height;
          const ray = 9;

          ctx.beginPath();
          ctx.moveTo(x - ray, y);
          ctx.lineTo(x + ray, y);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(x, y - ray);
          ctx.lineTo(x, y + ray);
          ctx.stroke();
        }
      });

      ctx.globalAlpha = 1;
    },
    [reduceMotion, stars],
  );

  useCanvasAnimationLoop(canvasRef, {
    rootRef,
    onDraw: drawStars,
  });

  return (
    <div ref={rootRef} className="resume-stars-wrapper">
      <canvas ref={canvasRef} className="resume-stars-canvas" aria-hidden="true" />
    </div>
  );
};

const StarBackground = () => {
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
      <ResumeStarsCanvas />
    </div>
  );
};

interface PageProps {
  className?: string;
  density?: string;
  number?: string | number;
  children?: ReactNode;
}

const Page = forwardRef<HTMLDivElement, PageProps>(function Page(props, ref) {
  return (
    <div
      className={`page ${props.className || ''}`}
      ref={ref}
      data-density={props.density || 'soft'}
    >
      <div className="page-content">
        {props.children}
        <div className="page-footer">{props.number}</div>
      </div>
    </div>
  );
});

// Chapter label, title and ink flourish at the top of a page
const ChapterHeading = ({ n, children }: { n?: number; children: ReactNode }) => {
  const { t } = useTranslation();
  return (
    <div className="chapter-heading">
      {n !== undefined && (
        <p className="chapter-label">
          <span aria-hidden="true">✦ </span>
          {t('resume_content.chapter', { n })}
          <span aria-hidden="true"> ✦</span>
        </p>
      )}
      <h2 className="page-header">{children}</h2>
      <InkDivider />
    </div>
  );
};

// The book fades in together with its wrapper. It used to wait for the wrapper to finish
// ('beforeChildren' + a stagger), so it stayed invisible for over a second.
const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: 'easeOut',
      staggerChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

// page-flip: 0 = forward, 1 = back
const FLIP_FORWARD = 0;

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    let resizeTimeout: ReturnType<typeof setTimeout> | undefined;

    function handleResize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 100);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowSize;
};

const ResumeSection = ({ id }: { id: string }) => {
  const bookRef = useRef<HTMLFlipBook>(null);
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth < 1050;
  const [currentPage, setCurrentPage] = useState(0);
  // The page a flip in progress will land on, so the bookmark moves with the page instead of after it
  const [targetPage, setTargetPage] = useState<number | null>(null);
  const watchFrame = useRef<number | null>(null);
  const totalPages = 8;
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  // The closed book floats at an angle and turns to face you when you come near it
  const [isNearBook, setIsNearBook] = useState(false);
  const comeNear = () => setIsNearBook(true);
  const goAway = () => setIsNearBook(false);

  // warm the SocialsSection chunk early so it's ready before the user scroll-snaps into it
  useEffect(() => {
    import('./SocialsSection');
  }, []);

  const pageFlipApi = () => bookRef.current?.pageFlip();

  // With the cover shown on its own, the book shows the cover (0), the spreads 1-2, 3-4, 5-6 and
  // the back cover (7). A forward flip from the cover opens spread 1; other flips move two pages.
  const landingPage = (from: number, direction: number) => {
    if (direction === FLIP_FORWARD) return Math.min(totalPages - 1, from === 0 ? 1 : from + 2);
    return Math.max(0, from <= 1 ? 0 : from - 2);
  };

  const stopWatchingFlip = () => {
    if (watchFrame.current !== null) cancelAnimationFrame(watchFrame.current);
    watchFrame.current = null;
  };

  // 'flipping': a click or an arrow, the page will turn. 'user_fold': a drag, which only turns the
  // page once its corner has crossed the spine (page-flip's own rule), so that is followed per frame.
  const onChangeState = (e: { data: string }) => {
    stopWatchingFlip();
    if (e.data !== 'flipping' && e.data !== 'user_fold') {
      setTargetPage(null);
      return;
    }
    const follow = () => {
      const api = pageFlipApi();
      if (!api) return;
      const direction = api.getRender().getDirection();
      const calculation = api.getFlipController().getCalculation();
      const turns =
        e.data === 'flipping' || (calculation !== null && calculation.getPosition().x <= 0);
      setTargetPage(
        turns && direction !== null ? landingPage(api.getCurrentPageIndex(), direction) : null,
      );
      if (e.data === 'user_fold') watchFrame.current = requestAnimationFrame(follow);
    };
    follow();
  };

  // 'flip' fires before the state goes back to 'read', so currentPage is already right then
  const onFlip = (e: { data: number }) => {
    setCurrentPage(e.data);
  };

  useEffect(() => stopWatchingFlip, []);

  const onDownloadCV = () => {
    window.open(resumePDF, '_blank');
  };

  const shownPage = targetPage ?? currentPage;
  const isFrontCover = shownPage === 0;
  const isBackCover = shownPage === totalPages - 1;

  const getBookmarkState = () => {
    if (isMobile) return 'is-mobile-hidden';
    if (isFrontCover) return 'is-front';
    if (isBackCover) return 'is-back';
    return 'is-open';
  };

  const bookmarkState = getBookmarkState();
  // Shapes the leather boards and page edges under the flipbook: closed front, open or closed back
  const bookState = isFrontCover ? 'is-front' : isBackCover ? 'is-back' : 'is-open';
  const isTilted = isFrontCover && !isNearBook && !reduceMotion;

  const handlePrevClick = (e?: { preventDefault: () => void; stopPropagation: () => void }) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!isFrontCover) pageFlipApi()?.flipPrev();
  };

  const handleNextClick = (e?: { preventDefault: () => void; stopPropagation: () => void }) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!isBackCover) pageFlipApi()?.flipNext();
  };

  const scrollToSocials = () => {
    scrollToSection(document.getElementById('socials-section'));
  };

  return (
    <section id={id} className="resume-section">
      <h2 className="sr-only">{t('resume')}</h2>
      <StarBackground />

      {isMobile ? (
        <motion.div
          key="mobile-view"
          className="mobile-resume-view"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
        >
          <div className="mobile-card">
            <div className="icon-circle">
              <Code size={40} className="mobile-icon" />
            </div>
            <p className="mobile-title">Victoria</p>
            <p className="mobile-subtitle">{t('resume_content.cover.subtitle')}</p>

            <div className="mobile-divider"></div>

            <p className="mobile-desc">{t('resume_content.p1.text')}</p>

            <button className="mobile-download-btn" onClick={onDownloadCV}>
              <Download size={20} />
              <span>{t('resume_content.p6.btn_pdf')}</span>
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="desktop-view"
          className={`book-wrapper ${isMobile ? 'mobile-mode' : ''}`}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.button
            type="button"
            variants={itemVariants}
            onPointerEnter={comeNear}
            onPointerLeave={goAway}
            className={`nav-arrow left ${isFrontCover ? 'disabled' : ''}`}
            aria-label={t('resume_content.nav.prev')}
            onClick={(e) => handlePrevClick(e)}
            disabled={isFrontCover}
            style={{
              cursor: isFrontCover ? 'default' : 'pointer',
              pointerEvents: isFrontCover ? 'none' : 'auto',
              opacity: isFrontCover ? 0.3 : 1,
            }}
          >
            <ChevronLeft size={isMobile ? 30 : 45} />
          </motion.button>

          <motion.div
            className={`book-container ${bookState} ${isTilted ? 'is-tilted' : ''}`}
            variants={itemVariants}
            onPointerEnter={comeNear}
            onPointerLeave={goAway}
            onFocus={comeNear}
            onBlur={goAway}
          >
            <div className="book-float">
              <div className="book-shadow" aria-hidden="true"></div>
              <div className="book-3d">
                <div className="book-body" aria-hidden="true">
                  <div className="book-board"></div>
                  <div className="page-block left"></div>
                  <div className="page-block right"></div>
                </div>
                {/* the closed book's thickness, seen while it is tilted */}
                <div className="book-edges" aria-hidden="true">
                  <div className="edge back-board"></div>
                  <div className="edge pages-fore"></div>
                  <div className="edge pages-bottom"></div>
                  <div className="edge strap"></div>
                </div>
                {!isMobile && (
                  <button
                    type="button"
                    className={`bookmark-tab ${bookmarkState}`}
                    aria-label={t('resume_content.actions.download_cv')}
                    onClick={onDownloadCV}
                    disabled={isFrontCover || isBackCover}
                    style={{
                      cursor: isFrontCover || isBackCover ? 'default' : 'pointer',
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
                  </button>
                )}
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
                  onChangeState={onChangeState}
                  flippingTime={900}
                  usePortrait={false}
                  startPage={0}
                  autoSize={true}
                  showPageCorners={true}
                  drawShadow={true}
                  maxShadowOpacity={1}
                >
                  {/* Pagina 0: Cover */}
                  <Page number="" className="is-cover page-right" density="hard">
                    <div className="cover-content">
                      <div className="cover-text-group">
                        <p className="book-title">Victoria</p>
                        <p className="book-subtitle">{t('resume_content.cover.subtitle')}</p>
                      </div>
                      <p className="edition-badge">{t('resume_content.cover.edition')}</p>
                    </div>
                  </Page>

                  {/* Page 1: Professional Profile */}
                  <Page number="1" className="page-left">
                    <div className="page-inner-centered">
                      <ChapterHeading n={1}>{t('resume_content.p1.title')}</ChapterHeading>
                      <div className="section-content">
                        <p className="summary-text">{t('resume_content.p1.text')}</p>
                      </div>
                    </div>
                  </Page>

                  {/* Page 2: Associate Degree */}
                  <Page number="2" className="page-right">
                    <div className="page-inner">
                      <ChapterHeading n={2}>{t('resume_content.p2.title')}</ChapterHeading>
                      <div className="section-content">
                        <span className="year-label">2023 - 2025</span>
                        <h3>{t('resume_content.p2.program')}</h3>
                        <p className="subtitle-text">{t('resume_content.p2.school')}</p>
                        <div className="distinction">
                          <WaxSeal />
                          <p className="distinction-text">{t('resume_content.p2.distinction')}</p>
                        </div>
                        <ul className="achievement-list">
                          <li>
                            <Trans i18nKey="resume_content.p2.list_dev">
                              <strong>Development:</strong>
                            </Trans>
                          </li>
                          <li>
                            <Trans i18nKey="resume_content.p2.list_infra">
                              <strong>Infrastructure:</strong>
                            </Trans>
                          </li>
                          <li>
                            <Trans i18nKey="resume_content.p2.list_method">
                              <strong>Methodology:</strong>
                            </Trans>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </Page>

                  {/* Page 3: Bachelor's Degree (Page 2) */}
                  <Page number="3" className="page-left">
                    <div className="page-inner">
                      <ChapterHeading n={3}>{t('resume_content.p3.title')}</ChapterHeading>
                      <div className="section-content">
                        <span className="year-label">2025 - 2027</span>
                        <h3>{t('resume_content.p3.program')}</h3>
                        <p className="subtitle-text">{t('resume_content.p3.specialization')}</p>
                        <div className="highlight-box">
                          <Trans i18nKey="resume_content.p3.track_info">
                            <strong>Accelerated Track:</strong>
                          </Trans>
                        </div>
                        <ul>
                          <li>
                            <Trans
                              i18nKey="resume_content.p3.list_arch_design"
                              components={[<strong />]}
                            />
                          </li>
                          <li>
                            <Trans
                              i18nKey="resume_content.p3.list_engineering"
                              components={[<strong />]}
                            />
                          </li>
                          <li>
                            <Trans
                              i18nKey="resume_content.p3.list_systems_data"
                              components={[<strong />]}
                            />
                          </li>
                          <li>
                            <Trans
                              i18nKey="resume_content.p3.list_web_security"
                              components={[<strong />]}
                            />
                          </li>
                        </ul>
                      </div>
                    </div>
                  </Page>

                  {/* Page 4: Professional Experience (Page 3) */}
                  <Page number="4" className="page-right">
                    <div className="page-inner">
                      <ChapterHeading n={4}>{t('resume_content.p4.title')}</ChapterHeading>
                      <div className="section-content">
                        <span className="year-label">{t('resume_content.p4.context')}</span>
                        <h3>Vanden Broele</h3>
                        <p className="subtitle-text">{t('resume_content.p4.role')}</p>
                        <ul>
                          <li>
                            <Trans i18nKey="resume_content.p4.bullet_1">
                              <strong>OpenSearch</strong>
                            </Trans>
                          </li>
                          <li>
                            <Trans i18nKey="resume_content.p4.bullet_2">
                              <strong>Docker</strong>
                            </Trans>
                          </li>
                        </ul>
                        <div className="tech-tags-container">
                          <span>.NET CORE</span> <span>C#</span> <span>OPENSEARCH</span>{' '}
                          <span>DOCKER</span> <span>TYPESCRIPT</span>
                        </div>
                      </div>
                    </div>
                  </Page>

                  {/* Page 5: Career Vision (Page 4) */}
                  <Page number="5" className="page-left">
                    <div className="page-inner">
                      <ChapterHeading n={5}>{t('resume_content.p5.title')}</ChapterHeading>
                      <div className="section-content">
                        <div className="goal-section">
                          <h4 className="subtitle-gold">{t('resume_content.p5.target_title')}</h4>
                          <p>{t('resume_content.p5.target_text')}</p>
                        </div>
                        <div className="goal-section" style={{ marginTop: '20px' }}>
                          <h4 className="subtitle-gold">
                            {t('resume_content.p5.readiness_title')}
                          </h4>
                          <ul className="goal-list-compact">
                            <li>
                              <Trans i18nKey="resume_content.p5.list_jp">
                                <strong>Japanese:</strong>
                              </Trans>
                            </li>
                            <li>
                              <Trans i18nKey="resume_content.p5.list_tech">
                                <strong>Technical:</strong>
                              </Trans>
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
                        <ChapterHeading>{t('resume_content.p6.title')}</ChapterHeading>
                        <p className="sub-text">
                          <Trans
                            i18nKey="resume_content.p6.text"
                            components={[<strong key="net" />, <strong key="intl" />]}
                          />
                        </p>
                        <button className="download-btn-styled" onClick={onDownloadCV}>
                          <Download size={16} /> {t('resume_content.p6.btn_pdf')}
                        </button>
                        <button
                          type="button"
                          className="scroll-hint"
                          aria-label={t('resume_content.actions.scroll_to_socials')}
                          onClick={scrollToSocials}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            marginTop: '15px',
                          }}
                        >
                          {t('resume_content.p6.scroll_hint')}
                          <ArrowDown size={18} />
                        </button>
                      </div>
                    </div>
                  </Page>

                  {/* Pagina 7: Back Cover */}
                  <Page number="" className="is-cover is-back-cover page-left" density="hard">
                    <div className="cover-content">
                      <div className="back-cover-content">
                        <p className="copyright">© 2026 Victoria Ghoos</p>
                        <p className="tech-badge">{t('resume_content.cover.built_with')}</p>
                      </div>
                    </div>
                  </Page>
                </HTMLFlipBook>
              </div>
            </div>
          </motion.div>

          <motion.button
            type="button"
            variants={itemVariants}
            onPointerEnter={comeNear}
            onPointerLeave={goAway}
            className={`nav-arrow right ${isBackCover ? 'disabled' : ''}`}
            aria-label={t('resume_content.nav.next')}
            onClick={(e) => handleNextClick(e)}
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
      )}
    </section>
  );
};

export default ResumeSection;
