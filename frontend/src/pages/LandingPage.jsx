import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
export default function PrepLensLanding() {
  const [bootComplete, setBootComplete] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [titleIndex, setTitleIndex] = useState(0);
  const [activeMode, setActiveMode] = useState('smart');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const [scrollProgress, setScrollProgress] = useState(0);
const navigate = useNavigate();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.95]);

  const titleText = "Track your DSA like an engineer.";

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 57;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navHeight;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setScanComplete(true), 1200);
    const bootTimer = setTimeout(() => setBootComplete(true), 1800);
    return () => {
      clearTimeout(timer);
      clearTimeout(bootTimer);
    };
  }, []);

  useEffect(() => {
    if (!bootComplete) return;
    if (titleIndex < titleText.length) {
      const timer = setTimeout(() => setTitleIndex(titleIndex + 1), 40);
      return () => clearTimeout(timer);
    }
  }, [bootComplete, titleIndex, titleText.length]);

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 25 + 20,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-mono relative overflow-hidden">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ delay: 1.5, duration: 0.8, type: 'spring', damping: 20 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-900 bg-black/80 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ x: 2 }}
          >
            <div className="text-xl font-bold text-zinc-100">PrepLens</div>
            <div className="text-[8px] text-zinc-700 tracking-widest">v2.1</div>
          </motion.div>

          <div className="hidden md:flex items-center space-x-8 text-sm">
            <motion.button 
              onClick={() => scrollToSection('features')}
              className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              whileHover={{ y: -2 }}
            >
              Features
            </motion.button>
            <motion.button 
              onClick={() => scrollToSection('insights')}
              className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              whileHover={{ y: -2 }}
            >
              Insights
            </motion.button>
            <motion.button 
              onClick={() => scrollToSection('docs')}
              className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              whileHover={{ y: -2 }}
            >
              Docs
            </motion.button>
          </div>

          <div className="flex items-center space-x-3">
            <motion.button 
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors px-4 py-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={
                ()=>{
                    navigate("/auth")
                }
              }
            >
              Sign In
            </motion.button>
            <motion.button 
              className="text-sm bg-zinc-800 border border-zinc-700 text-zinc-300 px-4 py-2 hover:border-zinc-600 transition-all relative overflow-hidden group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={   
                    ()=>{
                        navigate("/auth")
                    }
                }
            >
              
                
              
                <span className="relative z-10">Get Started</span>
            
              <motion.div
                className="absolute inset-0 bg-zinc-700"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.2 }}
              />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      <motion.div 
        className="fixed top-[57px] left-0 h-0.5 bg-zinc-600 z-50"
        style={{ width: `${scrollProgress}%` }}
      />

      <div className="absolute inset-0 opacity-20">
        <motion.div 
          className="absolute inset-0"
          animate={{ 
            backgroundPosition: ['0px 0px', '50px 50px']
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear'
          }}
          style={{
            backgroundImage: `
              linear-gradient(rgba(39, 39, 42, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(39, 39, 42, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-zinc-600"
          initial={{ 
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: 0.2
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut'
          }}
        />
      ))}

      <motion.div 
        className="absolute w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none"
        animate={{
          left: `${mousePosition.x}%`,
          top: `${mousePosition.y}%`,
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 100 }}
        style={{
          background: 'radial-gradient(circle, rgba(161, 161, 170, 0.15) 0%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
          opacity: 0.6
        }}
      />

      {!scanComplete && (
        <motion.div
          className="absolute top-0 left-0 right-0 h-px bg-zinc-500 shadow-[0_0_15px_rgba(161,161,170,0.7)]"
          initial={{ top: 0 }}
          animate={{ top: '100%' }}
          transition={{ duration: 1, ease: 'linear' }}
        />
      )}

      {scanComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <motion.section 
            id="hero"
            className="min-h-screen flex items-center px-8 md:px-16 lg:px-24 relative pt-20"
            style={{ opacity, scale }}
          >
            <div className="max-w-7xl w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="space-y-8"
              >
                <motion.div 
                  className="text-[10px] text-zinc-600 tracking-widest"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  PREPARATION INTELLIGENCE v2.1.4
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, type: 'spring', damping: 20 }}
                  className="text-7xl md:text-8xl font-bold tracking-tight text-zinc-100"
                >
                  PrepLens
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  transition={{ delay: 0.8, duration: 1 }}
                  className="text-2xl md:text-3xl text-zinc-400 font-light max-w-3xl"
                >
                  {titleText.slice(0, titleIndex)}
                  <motion.span 
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    |
                  </motion.span>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                  className="text-zinc-500 text-lg max-w-2xl leading-relaxed"
                >
                  No guesswork. No noise. Just data-backed preparation.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.8, duration: 0.6 }}
                  className="flex gap-4"
                >
                  <motion.button 
                    className="group relative px-8 py-4 bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm tracking-widest overflow-hidden"
                    whileHover={{ scale: 1.02, borderColor: '#52525b' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.span 
                      className="relative z-10"
                      animate={{ x: [0, 2, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <button
                      onClick={
                        ()=>{
                            navigate("/auth")
                        }
                      }
                      >
                        → ENTER PREPLENS
                      </button>
                    </motion.span>
                    <motion.div 
                      className="absolute inset-0 bg-zinc-700"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 0.2 }}
                      transition={{ duration: 0.3 }}
                    />
                    <motion.div 
                      className="absolute inset-0"
                      animate={{ 
                        background: [
                          'radial-gradient(circle at 0% 50%, rgba(161, 161, 170, 0.3) 0%, transparent 50%)',
                          'radial-gradient(circle at 100% 50%, rgba(161, 161, 170, 0.3) 0%, transparent 50%)',
                          'radial-gradient(circle at 0% 50%, rgba(161, 161, 170, 0.3) 0%, transparent 50%)'
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />
                  </motion.button>

                  <motion.button 
                    className="px-8 py-4 border border-zinc-800 text-zinc-500 text-sm tracking-widest hover:border-zinc-700 hover:text-zinc-400 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    LEARN MORE
                  </motion.button>
                </motion.div>
              </motion.div>
            </div>

            <motion.div 
              className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-zinc-800"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2, duration: 0.5 }}
            />
            <motion.div 
              className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-zinc-800"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.2, duration: 0.5 }}
            />
          </motion.section>

          <section id="features" className="min-h-screen flex items-center px-8 md:px-16 lg:px-24 py-24">
            <div className="max-w-7xl w-full">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true, margin: '-100px' }}
                className="space-y-12"
              >
                <div className="space-y-2">
                  <motion.div 
                    className="text-[10px] text-zinc-600 tracking-widest"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                  >
                    INPUT METHODS
                  </motion.div>
                  <motion.h2 
                    className="text-4xl font-bold text-zinc-100"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                  >
                    Choose your interface
                  </motion.h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <ModeCard 
                    mode="smart"
                    activeMode={activeMode}
                    setActiveMode={setActiveMode}
                    delay={0.2}
                  />
                  <ModeCard 
                    mode="manual"
                    activeMode={activeMode}
                    setActiveMode={setActiveMode}
                    delay={0.4}
                  />
                </div>
              </motion.div>
            </div>
          </section>

          <section id="insights" className="min-h-screen flex items-center px-8 md:px-16 lg:px-24 py-24">
            <div className="max-w-7xl w-full">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-12"
              >
                <div className="space-y-2">
                  <motion.div 
                    className="text-[10px] text-zinc-600 tracking-widest"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                  >
                    SYSTEM OUTPUT
                  </motion.div>
                  <motion.h2 
                    className="text-4xl font-bold text-zinc-100"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                  >
                    Your preparation, quantified
                  </motion.h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { label: 'Problems Solved', value: 347, unit: '' },
                    { label: 'Accuracy Rate', value: 87, unit: '%' },
                    { label: 'Avg Solve Time', value: 42, unit: 'min' }
                  ].map((stat, i) => (
                    <StatCard key={i} stat={stat} delay={i * 0.2} />
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          <section id="docs" className="min-h-screen flex items-center px-8 md:px-16 lg:px-24 py-24">
            <div className="max-w-4xl">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-16"
              >
                <div className="space-y-2">
                  <motion.div 
                    className="text-[10px] text-zinc-600 tracking-widest"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                  >
                    EXECUTION
                  </motion.div>
                  <motion.h2 
                    className="text-4xl font-bold text-zinc-100"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                  >
                    How it works
                  </motion.h2>
                </div>

                <div className="space-y-8">
                  {[
                    'Paste problem',
                    'Solve',
                    'Mark progress',
                    'Analyze patterns'
                  ].map((step, i) => (
                    <Step key={i} text={step} index={i + 1} delay={i * 0.15} />
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          <section className="min-h-screen flex items-center px-8 md:px-16 lg:px-24 py-24">
            <div className="max-w-4xl">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-16"
              >
                <div className="space-y-8">
                  <DiffLine text1="Most platforms count problems." text2="PrepLens exposes patterns." delay={0} />
                  <DiffLine text1="Others push content." text2="PrepLens exposes truth." delay={0.2} />
                  <DiffLine text1="They track completion." text2="We track competence." delay={0.4} />
                </div>
              </motion.div>
            </div>
          </section>

          <section className="min-h-screen flex items-center justify-center px-8 py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2 }}
              viewport={{ once: true }}
              className="text-center space-y-12"
            >
              <motion.h2 
                className="text-5xl md:text-6xl font-bold text-zinc-100"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                Stop preparing blindly.
              </motion.h2>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <motion.button 
                  className="group relative px-12 py-5 bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm tracking-widest overflow-hidden"
                  whileHover={{ scale: 1.05, borderColor: '#52525b' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.span 
                    className="relative z-10"
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    → LAUNCH PREPLENS
                  </motion.span>
                  <motion.div 
                    className="absolute inset-0"
                    animate={{ 
                      background: [
                        'radial-gradient(circle at 50% 50%, rgba(161, 161, 170, 0.2) 0%, transparent 50%)',
                        'radial-gradient(circle at 50% 50%, rgba(161, 161, 170, 0.3) 0%, transparent 60%)',
                        'radial-gradient(circle at 50% 50%, rgba(161, 161, 170, 0.2) 0%, transparent 50%)'
                      ]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </motion.button>

                <motion.button 
                  className="px-12 py-5 border border-zinc-800 text-zinc-500 text-sm tracking-widest hover:border-zinc-700 hover:text-zinc-400 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={
                    ()=>{
                        navigate("/auth")
                    }
                  }
                >
                  CREATE ACCOUNT
                </motion.button>
              </motion.div>

              <motion.div 
                className="pt-16 text-[10px] text-zinc-700 tracking-widest"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                PREPLENS © 2025 — PREPARATION INTELLIGENCE SYSTEM
              </motion.div>
            </motion.div>
          </section>
        </motion.div>
      )}
    </div>
  );
}

function ModeCard({ mode, activeMode, setActiveMode, delay }) {
  const isActive = activeMode === mode;
  const content = mode === 'smart' 
    ? { num: '01', title: 'Smart Link', desc: 'Paste a problem link. PrepLens handles the rest.' }
    : { num: '02', title: 'Manual Entry', desc: 'Total control. Zero shortcuts.' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      viewport={{ once: true }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      onClick={() => setActiveMode(mode)}
      className={`relative border p-8 bg-zinc-950/80 backdrop-blur-sm cursor-pointer transition-all duration-300 ${
        isActive ? 'border-zinc-600 shadow-[0_0_30px_rgba(161,161,170,0.1)]' : 'border-zinc-800'
      }`}
    >
      {isActive && (
        <>
          <motion.div 
            className="absolute inset-0 border-2 border-zinc-600 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div 
              className="absolute top-0 left-0 w-1 bg-gradient-to-b from-zinc-400 via-zinc-600 to-transparent"
              animate={{ 
                height: ['0%', '100%'],
                opacity: [1, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          </motion.div>
          <motion.div
            className="absolute inset-0 bg-zinc-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.05, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </>
      )}
      <div className="space-y-4 relative z-10">
        <div className="text-xs text-zinc-600 tracking-widest">MODE {content.num}</div>
        <h3 className="text-2xl font-bold text-zinc-100">{content.title}</h3>
        <p className="text-zinc-500 leading-relaxed">{content.desc}</p>
      </div>
    </motion.div>
  );
}

function StatCard({ stat, delay }) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = stat.value;
    const duration = 2000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isInView, stat.value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      viewport={{ once: true }}
      whileHover={{ 
        y: -4,
        rotateX: 2,
        transition: { duration: 0.2 }
      }}
      className="relative border border-zinc-800 p-6 bg-zinc-950/50 backdrop-blur-sm group cursor-pointer"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="space-y-4">
        <motion.div 
          className="text-[10px] text-zinc-600 tracking-widest"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, delay }}
        >
          {stat.label}
        </motion.div>
        <div className="text-4xl font-bold text-zinc-100">
          {count}{stat.unit}
        </div>
      </div>
      <motion.div
        className="absolute bottom-0 left-0 h-px bg-zinc-700"
        initial={{ width: '0%' }}
        whileInView={{ width: '100%' }}
        transition={{ delay: delay + 0.3, duration: 0.8 }}
        viewport={{ once: true }}
      />
      <motion.div
        className="absolute inset-0 bg-zinc-800 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
      />
    </motion.div>
  );
}

function Step({ text, index, delay }) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      viewport={{ once: true }}
      whileHover={{ x: 10, transition: { duration: 0.2 } }}
      className="relative group cursor-pointer"
    >
      <div className="flex items-baseline space-x-4">
        <motion.span 
          className="text-zinc-700 text-sm font-mono"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay }}
        >
          0{index}
        </motion.span>
        <div className="flex-1 space-y-2">
          <h3 className="text-2xl text-zinc-100 group-hover:text-zinc-300 transition-colors">
            {text}
          </h3>
          <motion.div
            className="h-px bg-zinc-800 group-hover:bg-zinc-700 transition-colors"
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ delay: delay + 0.3, duration: 0.6 }}
            style={{ transformOrigin: 'left' }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function DiffLine({ text1, text2, delay }) {
return (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.6 }}
        viewport={{ once: true }}
        className="space-y-2"
    >
        <div className="flex items-center space-x-4">
            <span className="text-red-500/60 text-sm">-</span>
            <span className="text-zinc-600 line-through">{text1}</span>
        </div>
        <div className="flex items-center space-x-4">
            <span className="text-green-500/60 text-sm">+</span>
            <span className="text-zinc-300">{text2}</span>
        </div>
    </motion.div>
);
}