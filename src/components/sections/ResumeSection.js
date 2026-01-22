import React, { forwardRef, useRef, useMemo } from "react";
import HTMLFlipBook from "react-pageflip";
import { motion } from "framer-motion";
import { Monitor, Rocket, Download, Star, Terminal, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import "../../styles/sections/ResumeSection.scss";

const StarBackground = () => {
  const stars = useMemo(() => {
    return [...Array(200)].map((_, i) => ({
      id: i,
      size: Math.random() * 2 + 1,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
      opacity: 0.3 + Math.random() * 0.7,
    }));
  }, []);

  return (
    <div className="cosmic-background">
      <div className="nebula nebula-1"></div>
      <div className="nebula nebula-2"></div>
      
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
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
    <div className="page" ref={ref}>
      <div className="page-content">
        {props.children}
        <div className="page-footer">{props.number}</div>
      </div>
    </div>
  );
});

const ResumeSection = ({ id }) => {
  const bookRef = useRef(null);

  const onDownloadCV = () => {
    window.open("/path-to-your-cv.pdf", "_blank");
  };

  return (
    <section id={id} className="resume-section">
      <StarBackground />

      <motion.div
        className="book-wrapper"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <button className="nav-arrow left" onClick={() => bookRef.current.pageFlip().flipPrev()}>
          <ChevronLeft size={45} />
        </button>

        <div className="book-container">
          <div className="bookmark-tab" onClick={onDownloadCV}>
            <Download size={18} />
            <span>PDF CV</span>
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
            flippingTime={1000}
            usePortrait={false}
            startPage={0}
            autoSize={false}
            showPageCorners={false}
            drawShadow={true}
          >
             <Page number="">
              <div className="cover-content">
                <div className="constellation-art">
                  <Monitor size={70} strokeWidth={1} />
                </div>
                <h1 className="book-title">Stellar Mission Log</h1>
                <h2 className="book-subtitle">Software Engineering Journal</h2>
                <div className="divider"></div>
                <p className="phase">Bachelor Technical Informatics</p>
              </div>
            </Page>

            <Page number="">
              <div className="intro-page">
                <h3>Mission Briefing</h3>
                <p>Welcome to my technical logbook. Here I document the evolution of my engineering skills.</p>
                <div className="small-stars">✦ ✦ ✦</div>
              </div>
            </Page>

            <Page number="1">
              <div className="timeline-page">
                <h2 className="page-header"><Rocket size={18} /> The Ignition</h2>
                <div className="timeline-content">
                  <div className="year">2022 - 2024</div>
                  <h3>Graduaat Programmeren</h3>
                  <p>Howest Kortrijk. Building the core foundation in C#, Java & Web.</p>
                </div>
              </div>
            </Page>

            <Page number="2">
              <div className="timeline-page">
                <h2 className="page-header"><Star size={18} /> Deep Space</h2>
                <div className="timeline-content">
                  <div className="year">2024 - 2026</div>
                  <h3>Bachelor TI</h3>
                  <p>Specializing in Software Engineering. Short-track traject.</p>
                </div>
              </div>
            </Page>

            <Page number="3">
              <div className="internship-page">
                <h2 className="page-header"><Terminal size={18} /> Mission: Vanden Broele</h2>
                <div className="achievement-card">
                  <p className="role">Internship Software Engineer</p>
                  <span className="desc">Optimizing data indexing & search capabilities.</span>
                </div>
              </div>
            </Page>

            <Page number="4">
              <div className="internship-page">
                <h3 className="sub-header">Technical Focus</h3>
                <div className="spec-box"><Zap size={14} /> OpenSearch</div>
                <p className="log-text">Implemented search queries and indexing strategies.</p>
              </div>
            </Page>

            <Page number="5">
              <div className="future-page">
                <h2>Next Horizon</h2>
                <p>Seeking new challenges in complex software systems.</p>
                <div className="mission-continues">Mission continues...</div>
              </div>
            </Page>

            <Page number="">
              <div className="back-cover">
                <div className="download-circle" onClick={onDownloadCV}>
                  <Download size={30} />
                </div>
                <p>Download Mission Report</p>
              </div>
            </Page>
          </HTMLFlipBook>
        </div>

        <button className="nav-arrow right" onClick={() => bookRef.current.pageFlip().flipNext()}>
          <ChevronRight size={45} />
        </button>
      </motion.div>
    </section>
  );
};

export default ResumeSection;