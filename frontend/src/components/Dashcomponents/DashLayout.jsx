import React, { useState, useEffect } from 'react';
import Sidebar from "./SideBar.jsx";



export default function DashboardLayout({ children }) {
  const [particles, setParticles] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });



  useEffect(() => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
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



  return (
    <div className="min-h-screen bg-black text-zinc-300 font-mono">
      {/* Animated grid background */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(39, 39, 42, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(39, 39, 42, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridMove 20s linear infinite'
          }}
        />
      </div>



      {/* Floating particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="fixed w-1 h-1 bg-zinc-600 rounded-full opacity-20 pointer-events-none"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animation: `float ${particle.duration}s ease-in-out infinite ${particle.delay}s`
          }}
        />
      ))}



      {/* Mouse gradient effect */}
      <div 
        className="fixed w-96 h-96 rounded-full opacity-5 blur-3xl transition-all duration-500 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(161, 161, 170, 0.4) 0%, transparent 70%)',
          left: `${mousePosition.x}%`,
          top: `${mousePosition.y}%`,
          transform: 'translate(-50%, -50%)'
        }}
      />



      {/* Scanline effect */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-5"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(161, 161, 170, 0.05) 2px, rgba(161, 161, 170, 0.05) 4px)'
        }}
      />



      <Sidebar />
      
      <main className="ml-64 p-8 relative z-10">
        {children}
      </main>



      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  );
}
