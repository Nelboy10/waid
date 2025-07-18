// app/page.tsx
'use client';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';

export default function Home() {
  const [showFireworks, setShowFireworks] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<any[]>([]);

  useEffect(() => {
    setIsLoaded(true);
    
    // Initialiser l'audio context
    if (typeof window !== 'undefined') {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
    }

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    // Initial resize
    handleResize();
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Système de particules avancé
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Créer des particules
    const createParticles = () => {
      particlesRef.current = [];
      const particleCount = window.innerWidth < 768 ? 80 : 150;
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.5 + 0.2,
          color: `hsl(${Math.random() * 60 + 30}, 70%, 70%)`,
          pulse: Math.random() * 0.02 + 0.01
        });
      }
    };

    createParticles();

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach((particle, index) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.opacity += particle.pulse;
        
        if (particle.opacity > 0.8 || particle.opacity < 0.1) {
          particle.pulse *= -1;
        }
        
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();
        
        // Lignes de connexion
        particlesRef.current.slice(index + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = particle.color;
            ctx.globalAlpha = 0.1 * (1 - distance / 100);
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  const playSound = (frequency: number, duration: number) => {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  };

  const triggerFireworks = () => {
    setShowFireworks(true);
    // Jouer des sons de feux d'artifice
    [440, 554, 659, 880].forEach((freq, i) => {
      setTimeout(() => playSound(freq, 0.5), i * 200);
    });
    setTimeout(() => setShowFireworks(false), 4000);
  };

  return (
    <main className="min-h-screen bg-black relative overflow-hidden">
      {/* Canvas pour les particules */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: isLoaded ? 1 : 0 }}
      />

      {/* Fond dégradé animé */}
      <div 
        className="absolute inset-0 opacity-80"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%),
            linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f0f23 75%, #000000 100%)
          `,
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      />

      {/* Effet de curseur avancé */}
      <div
        className="fixed pointer-events-none z-50 mix-blend-difference"
        style={{
          left: mousePosition.x - 25,
          top: mousePosition.y - 25,
          width: '50px',
          height: '50px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 40%, transparent 70%)',
          borderRadius: '50%',
          transition: 'all 0.1s ease-out',
          filter: 'blur(1px)',
        }}
      />

      {/* Hologramme de fond */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-pink-900/10 animate-gradient-shift" />

      {/* Feux d'artifice avancés */}
      {showFireworks && (
        <div className="fixed inset-0 pointer-events-none z-30">
          {[...Array(window.innerWidth < 768 ? 10 : 20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-firework-advanced"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
                animationDelay: `${i * 0.15}s`,
                animationDuration: `${2 + Math.random()}s`
              }}
            >
              <div className="w-2 h-2 md:w-4 md:h-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full shadow-lg" />
              {[...Array(8)].map((_, j) => (
                <div
                  key={j}
                  className="absolute w-1 h-1 md:w-2 md:h-2 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full animate-spark"
                  style={{
                    transform: `rotate(${j * 45}deg) translateY(-${window.innerWidth < 768 ? 10 : 20}px)`,
                    animationDelay: `${0.5 + j * 0.1}s`
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Contenu principal */}
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center text-white px-4 sm:px-6 py-12">
        <div className="text-center max-w-6xl w-full px-4">
          {/* Titre avec effets avancés */}
          <div className="mb-8 sm:mb-16 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-red-500/20 blur-3xl animate-pulse-glow -z-10" />
            
            <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] xl:text-[12rem] font-black mb-6 sm:mb-8 leading-none relative">
              <span className="absolute inset-0 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 animate-gradient-flow">
                WAÏD
              </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-orange-300 to-red-300 blur-sm">
                WAÏD
              </span>
            </h1>
            
            {/* Sous-titre dynamique */}
            <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-yellow-400 mb-2 sm:mb-4 relative">
              <div className="absolute inset-0 bg-yellow-400/20 blur-2xl animate-pulse-slow" />
              <div className="relative flex items-center justify-center gap-2 sm:gap-4 md:gap-6">
                <span className="inline-block animate-spin-3d text-4xl sm:text-5xl md:text-6xl">🎂</span>
                <span className="tracking-[0.1em] sm:tracking-[0.2em] md:tracking-[0.3em] animate-text-glow">JOYEUX ANNIVERSAIRE</span>
                <span className="inline-block animate-spin-3d-reverse text-4xl sm:text-5xl md:text-6xl">🎉</span>
              </div>
            </div>
            
            {/* Ligne de séparation animée */}
            <div className="w-48 sm:w-64 md:w-80 lg:w-96 h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mx-auto animate-expand-contract" />
          </div>

          {/* Message avec typographie avancée */}
          <div className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl mb-8 sm:mb-12 md:mb-16 leading-relaxed space-y-4 sm:space-y-6">
            <p className="animate-text-reveal delay-1000 opacity-0">
              En ce jour <span className="text-yellow-400 font-bold animate-text-glow">extraordinaire</span>, 
              je te souhaite une vie remplie de
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 text-xl sm:text-2xl md:text-3xl font-bold">
              <span className="animate-text-reveal delay-1300 opacity-0 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                RÉUSSITE
              </span>
              <span className="animate-text-reveal delay-1500 opacity-0 bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                SANTÉ
              </span>
              <span className="animate-text-reveal delay-1700 opacity-0 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                AVENTURES
              </span>
            </div>
            <p className="animate-text-reveal delay-2000 opacity-0">
              Tu es une source d'<span className="text-yellow-400 font-bold animate-text-glow">inspiration</span> 
              et un vrai <span className="text-orange-400 font-bold animate-text-glow">frère</span> 
              <span className="text-2xl sm:text-3xl animate-bounce-gentle">💪🏼</span>
            </p>
            <p className="animate-text-reveal delay-2300 opacity-0 text-yellow-400 font-bold text-xl sm:text-2xl md:text-3xl">
              Que cette nouvelle année t'apporte tout ce que tu mérites
              <span className="text-3xl sm:text-4xl animate-sparkle ml-1 sm:ml-2">✨</span>
            </p>
          </div>

          {/* Photo avec effets ultra-avancés */}
          <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 xl:w-[30rem] xl:h-[30rem] mx-auto mb-8 sm:mb-12 md:mb-16 group">
            {/* Cadre holographique */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 via-red-500 via-purple-500 to-blue-500 animate-rainbow-spin p-1 sm:p-2">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-2 sm:p-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-transparent to-blue-400/20 animate-shimmer-fast" />
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <Image
                    src="/waid.jpg"
                    alt="Photo de Waïd"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-1000"
                    priority
                    sizes="(max-width: 640px) 192px, (max-width: 768px) 256px, (max-width: 1024px) 320px, (max-width: 1280px) 384px, 480px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent animate-diamond-shine" />
                </div>
              </div>
            </div>
            
            {/* Particules orbitales avancées */}
            <div className="absolute -top-6 -left-6 sm:-top-8 sm:-left-8 md:-top-10 md:-left-10 lg:-top-12 lg:-left-12 text-3xl sm:text-4xl md:text-5xl lg:text-6xl animate-orbit-complex">👑</div>
            <div className="absolute -top-6 -right-6 sm:-top-8 sm:-right-8 md:-top-10 md:-right-10 lg:-top-12 lg:-right-12 text-2xl sm:text-3xl md:text-4xl lg:text-5xl animate-orbit-complex-reverse">💎</div>
            <div className="absolute -bottom-6 -left-6 sm:-bottom-8 sm:-left-8 md:-bottom-10 md:-left-10 lg:-bottom-12 lg:-left-12 text-2xl sm:text-3xl md:text-4xl lg:text-5xl animate-orbit-complex-slow">🔥</div>
            <div className="absolute -bottom-6 -right-6 sm:-bottom-8 sm:-right-8 md:-bottom-10 md:-right-10 lg:-bottom-12 lg:-right-12 text-3xl sm:text-4xl md:text-5xl lg:text-6xl animate-orbit-complex-reverse-slow">⚡</div>
            
            {/* Halo lumineux */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/10 via-orange-500/10 to-red-500/10 animate-pulse-glow scale-150 blur-xl" />
          </div>

          {/* Signature royale */}
          <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6 md:mb-8 animate-text-reveal delay-2500 opacity-0">
            <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3 md:mb-4">
              <span className="text-4xl sm:text-5xl md:text-6xl animate-float-gentle">👑</span>
              <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent tracking-wider">
                AVEC TOUT MON RESPECT
              </span>
              <span className="text-4xl sm:text-5xl md:text-6xl animate-float-gentle-reverse">👑</span>
            </div>
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white">
              – <span className="text-yellow-400 font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl animate-text-glow">NEL</span> 
              <span className="text-3xl sm:text-4xl md:text-5xl animate-bounce-gentle ml-1 sm:ml-2">🏆</span>
            </div>
          </div>

          {/* Bouton feux d'artifice ultra-premium */}
          <button
            onClick={triggerFireworks}
            className="group relative px-8 py-4 sm:px-12 sm:py-6 md:px-16 md:py-8 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-black font-black text-base sm:text-lg md:text-xl lg:text-2xl rounded-full shadow-2xl hover:shadow-yellow-400/50 transform hover:scale-110 transition-all duration-500 overflow-hidden animate-text-reveal delay-3000 opacity-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-white/20 group-hover:animate-pulse" />
            <div className="relative flex items-center gap-2 sm:gap-4 md:gap-6">
              <span className="text-2xl sm:text-3xl md:text-4xl animate-spin-3d">🎆</span>
              <span className="tracking-wider">DÉCLENCHER LA MAGIE</span>
              <span className="text-2xl sm:text-3xl md:text-4xl animate-spin-3d-reverse">🎆</span>
            </div>
          </button>
        </div>
      </div>

      {/* Footer premium */}
      <footer className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 text-gray-400 animate-text-reveal delay-3500 opacity-0">
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 text-xs sm:text-sm md:text-base">
          <span className="text-yellow-400 animate-sparkle">✨</span>
          <span className="tracking-wider">© {new Date().getFullYear()} JOYEUX ANNIVERSAIRE PREMIUM</span>
          <span className="text-yellow-400 animate-sparkle">✨</span>
        </div>
      </footer>

      {/* Styles CSS ultra-avancés */}
      <style jsx global>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes gradient-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes rainbow-spin {
          0% { transform: rotate(0deg); filter: hue-rotate(0deg); }
          100% { transform: rotate(360deg); filter: hue-rotate(360deg); }
        }
        
        @keyframes spin-3d {
          0% { transform: rotateY(0deg) rotateX(0deg); }
          25% { transform: rotateY(90deg) rotateX(15deg); }
          50% { transform: rotateY(180deg) rotateX(0deg); }
          75% { transform: rotateY(270deg) rotateX(-15deg); }
          100% { transform: rotateY(360deg) rotateX(0deg); }
        }
        
        @keyframes spin-3d-reverse {
          0% { transform: rotateY(0deg) rotateX(0deg); }
          25% { transform: rotateY(-90deg) rotateX(-15deg); }
          50% { transform: rotateY(-180deg) rotateX(0deg); }
          75% { transform: rotateY(-270deg) rotateX(15deg); }
          100% { transform: rotateY(-360deg) rotateX(0deg); }
        }
        
        @keyframes text-glow {
          0%, 100% { text-shadow: 0 0 10px currentColor, 0 0 20px currentColor; }
          50% { text-shadow: 0 0 20px currentColor, 0 0 40px currentColor, 0 0 60px currentColor; }
        }
        
        @keyframes text-reveal {
          0% { opacity: 0; transform: translateY(30px) rotateX(90deg); }
          100% { opacity: 1; transform: translateY(0) rotateX(0deg); }
        }
        
        @keyframes sparkle {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.2) rotate(90deg); }
          50% { transform: scale(1) rotate(180deg); }
          75% { transform: scale(1.2) rotate(270deg); }
        }
        
        @keyframes diamond-shine {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }
        
        @keyframes shimmer-fast {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes orbit-complex {
          0% { transform: rotate(0deg) translateX(80px) rotate(0deg) scale(1); }
          25% { transform: rotate(90deg) translateX(80px) rotate(-90deg) scale(1.2); }
          50% { transform: rotate(180deg) translateX(80px) rotate(-180deg) scale(1); }
          75% { transform: rotate(270deg) translateX(80px) rotate(-270deg) scale(1.2); }
          100% { transform: rotate(360deg) translateX(80px) rotate(-360deg) scale(1); }
        }
        
        @keyframes orbit-complex-reverse {
          0% { transform: rotate(360deg) translateX(80px) rotate(360deg) scale(1); }
          25% { transform: rotate(270deg) translateX(80px) rotate(270deg) scale(1.2); }
          50% { transform: rotate(180deg) translateX(80px) rotate(180deg) scale(1); }
          75% { transform: rotate(90deg) translateX(80px) rotate(90deg) scale(1.2); }
          100% { transform: rotate(0deg) translateX(80px) rotate(0deg) scale(1); }
        }
        
        @keyframes orbit-complex-slow {
          0% { transform: rotate(0deg) translateX(60px) rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) translateX(60px) rotate(-180deg) scale(1.3); }
          100% { transform: rotate(360deg) translateX(60px) rotate(-360deg) scale(1); }
        }
        
        @keyframes orbit-complex-reverse-slow {
          0% { transform: rotate(360deg) translateX(60px) rotate(360deg) scale(1); }
          50% { transform: rotate(180deg) translateX(60px) rotate(180deg) scale(1.3); }
          100% { transform: rotate(0deg) translateX(60px) rotate(0deg) scale(1); }
        }
        
        @keyframes firework-advanced {
          0% { transform: scale(0) rotate(0deg); opacity: 1; }
          50% { transform: scale(1.5) rotate(180deg); opacity: 0.8; }
          100% { transform: scale(3) rotate(360deg); opacity: 0; }
        }
        
        @keyframes spark {
          0% { transform: scale(0) translateY(0); opacity: 1; }
          50% { transform: scale(1) translateY(-20px); opacity: 0.8; }
          100% { transform: scale(0) translateY(-40px); opacity: 0; }
        }
        
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        
        @keyframes float-gentle-reverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(-5deg); }
        }
        
        @keyframes expand-contract {
          0%, 100% { transform: scaleX(1); }
          50% { transform: scaleX(1.5); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        
        .animate-gradient-shift {
          animation: gradient-shift 8s ease infinite;
          background-size: 400% 400%;
        }
        
        .animate-gradient-flow {
          animation: gradient-flow 4s ease infinite;
          background-size: 300% 300%;
        }
        
        .animate-rainbow-spin {
          animation: rainbow-spin 8s linear infinite;
        }
        
        .animate-spin-3d {
          animation: spin-3d 4s ease-in-out infinite;
        }
        
        .animate-spin-3d-reverse {
          animation: spin-3d-reverse 4s ease-in-out infinite;
        }
        
        .animate-text-glow {
          animation: text-glow 2s ease-in-out infinite;
        }
        
        .animate-text-reveal {
          animation: text-reveal 1s ease-out forwards;
        }
        
        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }
        
        .animate-diamond-shine {
          animation: diamond-shine 3s ease-in-out infinite;
        }
        
        .animate-shimmer-fast {
          animation: shimmer-fast 2s ease-in-out infinite;
        }
        
        .animate-orbit-complex {
          animation: orbit-complex 12s linear infinite;
        }
        
        .animate-orbit-complex-reverse {
          animation: orbit-complex-reverse 10s linear infinite;
        }
        
        .animate-orbit-complex-slow {
          animation: orbit-complex-slow 15s linear infinite;
        }
        
        .animate-orbit-complex-reverse-slow {
          animation: orbit-complex-reverse-slow 18s linear infinite;
        }
        
        .animate-firework-advanced {
          animation: firework-advanced 2s ease-out forwards;
        }
        
        .animate-spark {
          animation: spark 1s ease-out forwards;
        }
        
        .animate-float-gentle {
          animation: float-gentle 4s ease-in-out infinite;
        }
        
        .animate-float-gentle-reverse {
          animation: float-gentle-reverse 4s ease-in-out infinite;
        }
        
        .animate-expand-contract {
          animation: expand-contract 3s ease-in-out infinite;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        
        .animate-bounce-gentle {
          animation: bounce-gentle 3s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .delay-1000 { animation-delay: 1s; }
        .delay-1300 { animation-delay: 1.3s; }
        .delay-1500 { animation-delay: 1.5s; }
        .delay-1700 { animation-delay: 1.7s; }
        .delay-2000 { animation-delay: 2s; }
        .delay-2300 { animation-delay: 2.3s; }
        .delay-2500 { animation-delay: 2.5s; }
        .delay-3000 { animation-delay: 3s; }
        .delay-3500 { animation-delay: 3.5s; }

        @media (max-width: 640px) {
          .animate-orbit-complex,
          .animate-orbit-complex-reverse {
            animation: orbit-complex 12s linear infinite;
            transform-origin: center;
          }
          
          .animate-orbit-complex-slow,
          .animate-orbit-complex-reverse-slow {
            animation: orbit-complex-slow 15s linear infinite;
            transform-origin: center;
          }
        }
      `}</style>
    </main>
  );
}