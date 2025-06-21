import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import RollingWord from '../components/RollingWord';
import { useScreenSize } from '../lib/useScreenSize';
import { usePostHog } from 'posthog-js/react';
import { Helmet } from 'react-helmet';

const LandingPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isMobile } = useScreenSize();
  const navigate = useNavigate();
  const location = useLocation();
  const posthog = usePostHog();
  
  // Track scroll position to show/hide footer
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 100; // Show footer after 100px of scrolling
      if (scrolled !== isScrolled) {
        setIsScrolled(scrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled]);
  
  // Extract referral ID from URL query parameters
  const [referrerId, setReferrerId] = useState<string | null>(null);
  
  // Extract referral ID from URL query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const refParam = queryParams.get('ref');
    if (refParam) {
      setReferrerId(refParam);
      // Track referral in PostHog
      posthog.capture('referral_detected', {
        referrer_id: refParam
      });
    }
  }, [location.search, posthog]);

  // Track landing page view with additional metadata
  useEffect(() => {
    posthog.capture('landing_page_viewed', {
      timestamp: new Date().toISOString(),
      is_mobile: isMobile,
      screen_width: window.innerWidth,
      screen_height: window.innerHeight,
      referrer: document.referrer || 'direct',
      user_agent: navigator.userAgent,
      referrer_id: referrerId
    });
    
    // Track scroll depth
    let maxScrollDepth = 0;
    const trackScrollDepth = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );
      
      const scrollPercent = Math.round((scrollTop / (docHeight - windowHeight)) * 100);
      
      if (scrollPercent > maxScrollDepth) {
        maxScrollDepth = scrollPercent;
        
        // Track at 25%, 50%, 75%, and 100% scroll depth
        if (maxScrollDepth === 25 || maxScrollDepth === 50 || maxScrollDepth === 75 || maxScrollDepth === 100) {
          posthog.capture('scroll_depth_milestone', {
            depth_percentage: maxScrollDepth,
            page: 'landing_page'
          });
        }
      }
    };
    
    window.addEventListener('scroll', trackScrollDepth);
    
    return () => {
      window.removeEventListener('scroll', trackScrollDepth);
      
      // Track max scroll depth on page leave
      posthog.capture('final_scroll_depth', {
        depth_percentage: maxScrollDepth,
        page: 'landing_page'
      });
    };
  }, [posthog, isMobile]);
  
  const handleButtonClick = () => {
    // Track the CTA button click with metadata
    posthog.capture('join_button_clicked', {
      timestamp: new Date().toISOString(),
      is_mobile: isMobile,
      location: 'landing_page',
      button_text: 'Join us'
    });
    
    setIsLoading(true);
    
    // Track loading state
    posthog.capture('loading_screen_started', {
      from_page: 'landing_page',
      to_page: 'onboarding_page'
    });
    
    // After 3 seconds, navigate to the video player instead of directly to profile onboarding
    const timer = setTimeout(() => {
      // Track navigation event
      posthog.capture('navigation_event', {
        from_page: 'landing_page',
        to_page: 'onboarding_page',
        navigation_type: 'automatic_redirect',
        time_on_loading_screen: 3000 // milliseconds
      });
      
      // Pass referrerId as a state object when navigating
      navigate('/join', { state: { referrerId } });
      setIsLoading(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3, // 0.2s between each child
        delayChildren: 0.4, // Initial delay before animation starts
      },
    },
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.9 }
    },
  };
  
  const slideVariants = {
    enter: { opacity: 0, y: 20 },
    center: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.5 } }
  };
  // List of potential serendipitous meetings
  const meetingOptions = ["meet your cofounder", "hire your first developer", "pitch your future investor", "discover your dream job", "create your Friday night", "meet your AI friend"];

  // Render different layouts based on screen size
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center relative">
      <Helmet>
        <title>Series</title>
        <meta name="description" content="The first AI social network. Don't bother your friends for warm intros, bother your AI friend (who knows more people anyway) instead." />
      </Helmet>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.a
            href="https://www.linkedin.com/company/joinseries/"
            target="_blank"
            rel="noopener noreferrer"
            key="loading"
            className="fixed inset-0 flex items-center justify-center bg-white z-50"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <div className="flex items-center">
              <motion.span
                className={`${isMobile ? 'text-[8rem]' : 'text-[10rem]'} font-bold leading-none inline-block relative`}
              >
                S
              </motion.span>
              <motion.div
                className={`${isMobile ? 'w-16 h-3' : 'w-20 h-4'} overflow-hidden ml-4 relative -bottom-12`}
                initial={{ scaleX: 0 }}
                animate={{ 
                  scaleX: 1,
                  transformOrigin: 'left center',
                }}
                transition={{ 
                  duration: 3,
                  ease: "easeInOut"
                }}
              >
                <motion.div 
                  className="h-full bg-black absolute top-0 left-0"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ 
                    duration: 3,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            </div>
          </motion.a>
        ) : (
          <>
            {/* Backer logos at top for mobile */}
            {isMobile && (
              <div className="fixed top-8 left-0 right-0 px-4 z-10">
                <div className="flex justify-center space-x-6">
                  <img src="/images/9 3.png" alt="See us on Forbes" className="h-8 w-auto opacity-70" />
                  <img src="/images/10 4.png" alt="See us on NBC" className="h-8 w-auto opacity-70" />
                  <img src="/images/9 1.png" alt="See us on Entrepreneur" className="h-8 w-auto opacity-70" />
                </div>
              </div>
            )}
            
            {/* Main content */}
            <motion.div 
              className={`text-center ${isMobile ? 'px-6' : 'max-w-2xl px-4'} mx-auto`}
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <motion.h1 
                className={`${isMobile ? 'text-5xl' : 'text-7xl'} font-bold mb-4`}
                variants={itemVariants}
              >
                Series
              </motion.h1>
              
              <motion.div 
                className="text-center mb-16"
                variants={itemVariants}
              >
                <div className={`${isMobile ? 'text-lg' : 'text-2xl'} text-gray-600 font-medium h-8 flex justify-center`}>
                  <RollingWord words={meetingOptions} />
                </div>
              </motion.div>

              {!isMobile && (
                <motion.p 
                  className="text-xl font-medium text-black/40 mb-8"
                  variants={itemVariants}
                >
                  The First AI Social Network
                </motion.p>
              )}
              
              <motion.button
                className="bg-black text-white rounded-full px-1 py-4 w-40 mb-10 inline-flex items-center justify-center hover:bg-black/80 transition-colors"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleButtonClick}
                data-tracking="join_button"
                onMouseEnter={() => {
                  posthog.capture('button_hover', {
                    button_name: 'join_button',
                    page: 'landing_page'
                  });
                }}
              >
                <span className="mr-3 text-xl font-medium">Join us</span> <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
            
            {/* Backer icons at the bottom for desktop */}
            {!isMobile && (
              <motion.div 
                className="fixed bottom-9 left-0 right-0 px-8"
                initial={{opacity: 0, y: 20}}
                animate={{
                  opacity:1,
                  y:0,
                  transition: { delay: 2.2, duration: 0.6}
                }}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-center text-gray-200 text-lg font-medium">
                    AS SEEN ON:
                  </span>
                  <a 
                    href="https://www.forbes.com/sites/davidprosser/2025/04/04/how-two-yale-juniors-just-raised-31-million-for-their-social-network/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="transition-all hover:brightness-100"
                    onClick={() => {
                      posthog.capture('external_link_clicked', {
                        link_text: 'Forbes',
                        link_url: 'https://www.forbes.com/sites/davidprosser/2025/04/04/how-two-yale-juniors-just-raised-31-million-for-their-social-network/',
                        link_position: 'footer',
                        link_type: 'press_coverage'
                      });
                    }}
                    data-tracking="forbes_link">
                    <img src="/images/9 3.png" alt="See us on Forbes" className="h-12 w-auto opacity-50 hover:opacity-100 transition-opacity" />
                  </a>
                  <a 
                    href="https://www.nbcnews.com/video/-series-co-founders-talk-about-what-it-took-to-get-the-social-network-off-the-ground-240629317572" 
                    className="transition-all hover:brightness-100"
                    onClick={() => {
                      posthog.capture('external_link_clicked', {
                        link_text: 'NBC News',
                        link_url: 'https://www.nbcnews.com/video/-series-co-founders-talk-about-what-it-took-to-get-the-social-network-off-the-ground-240629317572',
                        link_position: 'footer',
                        link_type: 'press_coverage'
                      });
                    }}
                    data-tracking="nbc_link">
                    <img src="/images/10 4.png" alt="See us on NBC" className="h-12 w-auto opacity-70 hover:opacity-100 transition-opacity" />
                  </a>
                  <a 
                    href="https://www.entrepreneur.com/starting-a-business/yale-students-raised-3m-in-14-days-for-anti-facebook/489578" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="transition-all hover:brightness-100"
                    onClick={() => {
                      posthog.capture('external_link_clicked', {
                        link_text: 'Entrepreneur',
                        link_url: 'https://www.entrepreneur.com/starting-a-business/yale-students-raised-3m-in-14-days-for-anti-facebook/489578',
                        link_position: 'footer',
                        link_type: 'press_coverage'
                      });
                    }}
                    data-tracking="entrepreneur_link">
                    <img src="/images/9 1.png" alt="See us on Entrepreneur" className="h-12 w-auto opacity-70 hover:opacity-100 transition-opacity" />
                  </a>
                  <a 
                    href="https://www.instagram.com/complex/p/DIQBHDpOWzm/?api=stake%E3%80%90GB77.CC%E3%80%91.aviu&hl=af&img_index=2" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="transition-all hover:brightness-100"
                    onClick={() => {
                      posthog.capture('external_link_clicked', {
                        link_text: 'Complex',
                        link_url: 'https://www.instagram.com/complex/p/DIQBHDpOWzm/?api=stake%E3%80%90GB77.CC%E3%80%91.aviu&hl=af&img_index=2',
                        link_position: 'footer',
                        link_type: 'press_coverage'
                      });
                    }}
                    data-tracking="complex_link">
                    <img src="/images/10 1.png" alt="See us on Complex" className="h-12 w-auto opacity-70 hover:opacity-100 transition-opacity" />
                  </a>
                  <a 
                    href="https://www.businessinsider.com/pitch-deck-series-gen-z-professional-network-ai-texting-2025-4" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="transition-all hover:brightness-100"
                    onClick={() => {
                      posthog.capture('external_link_clicked', {
                        link_text: 'Business Insider',
                        link_url: 'https://www.businessinsider.com/pitch-deck-series-gen-z-professional-network-ai-texting-2025-4',
                        link_position: 'footer',
                        link_type: 'press_coverage'
                      });
                    }}
                    data-tracking="business_insider_link">
                    <img src="/images/9 2.png" alt="See us on Business Insider" className="h-12 w-auto opacity-70 hover:opacity-100 transition-opacity" />
                  </a>
                  <a 
                    href="https://www.fox61.com/video/news/local/morning-show/yale-students-launch-series-social-network/520-07415f62-0362-460a-b229-9a8bb6f1f3f6" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="transition-all hover:brightness-100"
                    onClick={() => {
                      posthog.capture('external_link_clicked', {
                        link_text: 'Fox 61',
                        link_url: 'https://www.fox61.com/video/news/local/morning-show/yale-students-launch-series-social-network/520-07415f62-0362-460a-b229-9a8bb6f1f3f6',
                        link_position: 'footer',
                        link_type: 'press_coverage'
                      });
                    }}
                    data-tracking="fox_link">
                    <img src="/images/11 1.png" alt="See us on Fox 61" className="h-12 w-auto opacity-70 hover:opacity-100 transition-opacity" />
                  </a>
                  <a 
                    href="https://finance.yahoo.com/news/yale-nathaneo-johnson-sean-hargrow-182342002.html" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="transition-all hover:brightness-100"
                    onClick={() => {
                      posthog.capture('external_link_clicked', {
                        link_text: 'Yahoo Finance',
                        link_url: 'https://finance.yahoo.com/news/yale-nathaneo-johnson-sean-hargrow-182342002.html',
                        link_position: 'footer',
                        link_type: 'press_coverage'
                      });
                    }}
                    data-tracking="yahoo_link">
                    <img src="/images/image 2372.png" alt="See us on Yahoo" className="h-12 w-auto opacity-70 hover:opacity-100 transition-opacity" />
                  </a>
                </div>
              </motion.div>
            )}
            
            {/* Footer with links - only shown when scrolled */}
            <motion.footer 
              className={`fixed bottom-0 left-0 right-0 py-4 bg-white border-t border-gray-100 z-10 ${
                isScrolled ? 'translate-y-0' : 'translate-y-full'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: isScrolled ? 1 : 0,
                y: isScrolled ? 0 : 20,
              }}
              transition={{
                type: 'spring',
                damping: 20,
                stiffness: 300,
              }}
            >
              <div className="flex justify-center space-x-6 text-sm text-gray-500">
                <a 
                  href="/privacy" 
                  className="hover:text-black transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    posthog.capture('footer_link_clicked', { link: 'privacy' });
                    navigate('/privacy');
                  }}
                >
                  Privacy
                </a>
                <span>•</span>
                <a 
                  href="/terms" 
                  className="hover:text-black transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    posthog.capture('footer_link_clicked', { link: 'terms' });
                    navigate('/terms');
                  }}
                >
                  Terms of Use
                </a>
                <span>•</span>
                <a 
                  href="/tos" 
                  className="hover:text-black transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    posthog.capture('footer_link_clicked', { link: 'tos' });
                    navigate('/tos');
                  }}
                >
                  TOS
                </a>
              </div>
            </motion.footer>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
