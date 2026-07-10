import React from 'react';
import { ArrowRight, Sparkles, Building2, Globe2, Users2, Code2, GraduationCap, Laptop } from 'lucide-react';
import Yeakkhai from '../../../assets/images/Yeakkhai.png';
import Cheata from '../../../assets/images/Cheata.png';
import Nolly from '../../../assets/images/Nolly.png';
import Group from '../../../assets/images/Group.png';
import IDRI from '../../../assets/images/innovationcenter.png';

interface AboutProps {
  onExploreEventsClick: () => void;
}

export default function About({ onExploreEventsClick }: AboutProps) {

  const team = [
    {
      name: "Ly Yeakkhai",
      role: "CEO & FOUNDER",
      image: Yeakkhai,
      description: "Visionary leader driving the digital transformation of academic events at CADT."
    },
    {
      name: "Thoung Socheata",
      role: "HEAD OF CONTENT",
      image: Cheata,
      description: "Creative mind ensuring every event reaches its audience with clarity and impact."
    },
    {
      name: "So Channolly",
      role: "TECHNICAL LEAD",
      image: Nolly,
      description: "Engineering architect building robust and scalable platforms for the CADT community."
    }
  ];

  const pillars = [
    { 
      icon: <Users2 className="w-6 h-6 text-amber-400" />, 
      title: "Community First", 
      text: "Fostering deep connections between learners and mentors through shared experiences." 
    },
    { 
      icon: <Globe2 className="w-6 h-6 text-amber-400" />, 
      title: "Diversity", 
      text: "Curating a spectrum of events that reflect the global perspective of our academy." 
    },
    { 
      icon: <Sparkles className="w-6 h-6 text-amber-400" />, 
      title: "Innovation", 
      text: "Embracing new technologies to connect our community and showcase brilliant ideas." 
    }
  ];

  const institutes = [
    { name: "Institute of Digital Technology", abbr: "IDT", icon: <Code2 className="w-5 h-5" /> },
    { name: "Institute of Digital Governance", abbr: "IDG", icon: <Building2 className="w-5 h-5" /> },
    { name: "Institute of Digital Research & Innovation", abbr: "IDRI", icon: <Laptop className="w-5 h-5" /> },
  ]

  return (
    <div className="w-full min-h-screen bg-slate-50 font-sans antialiased text-slate-900 overflow-hidden">
      
      {/* =======================================================================
          HERO SECTION (Premium Deep Blue Brand Alignment)
         ======================================================================= */}
      <section className="relative w-full pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden bg-[#0b2c6a]">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img 
            src={IDRI}
            alt="CADT Campus Architecture" 
            className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-screen"
          />
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500 rounded-full blur-[120px] opacity-20 animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-amber-500 rounded-full blur-[150px] opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b2c6a]/50 via-[#0b2c6a]/80 to-[#0b2c6a]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6 animate-fade-in">
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white tracking-wider uppercase">Cambodia Academy of Digital Technology</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6 max-w-4xl animate-slide-up" style={{ animationDelay: '100ms' }}>
            Empowering the <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">Digital Scholars</span> of Tomorrow.
          </h1>
          
          <p className="text-blue-100/90 text-lg md:text-xl font-medium max-w-2xl leading-relaxed mb-10 animate-slide-up" style={{ animationDelay: '200ms' }}>
            Revolutionizing the academic event experience through a unified digital platform designed to bridge the gap between students, staff, and industry leaders.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <button 
              onClick={onExploreEventsClick}
              className="group px-8 py-4 bg-amber-400 hover:bg-amber-300 text-[#0b2c6a] text-sm font-black tracking-wide uppercase rounded-xl shadow-lg shadow-amber-400/20 transition-all active:scale-[0.98] flex items-center gap-2"
            >
              Explore Events
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
        
        {/* Custom shape divider */}
        <div className="absolute bottom-0 left-0 right-0">
           <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto text-slate-50">
             <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="currentColor"/>
           </svg>
        </div>
      </section>

      {/* =======================================================================
          THE STORY (Dynamic Overlapping Layout)
         ======================================================================= */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            {/* Left: Images */}
            <div className="relative group perspective-1000">
               <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-amber-100 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
               <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/50 bg-white p-2 transform transition-transform duration-700 hover:rotate-y-2 hover:scale-[1.02]">
                 <img 
                    src={Group} 
                    alt="CADT Team" 
                    className="w-full h-[400px] object-cover rounded-xl"
                 />
                 {/* Floating badge */}
                 <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 hidden md:block animate-bounce-slow">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-[#0b2c6a]/10 rounded-full flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-[#0b2c6a]" />
                       </div>
                       <div>
                         <p className="text-2xl font-black text-slate-900 leading-none">3</p>
                         <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Institutes</p>
                       </div>
                    </div>
                 </div>
               </div>
            </div>

            {/* Right: Content */}
            <div className="space-y-8">
              <div>
                <h2 className="text-sm font-black text-amber-500 tracking-widest uppercase mb-3 flex items-center gap-2">
                  <span className="w-8 h-0.5 bg-amber-500 rounded-full" /> Our Story
                </h2>
                <h3 className="text-3xl md:text-4xl font-black text-[#0b2c6a] tracking-tight leading-tight">
                  Bridging the gap between brilliant ideas and eager minds.
                </h3>
              </div>
              
              <div className="space-y-5 text-slate-600 text-lg leading-relaxed">
                <p>
                  CADT Event was born out of a simple observation: the vibrant life of our institution was often hidden behind fragmented communication channels and paper posters. We saw brilliant guest lectures with empty seats and student-led workshops that struggled to find their audience.
                </p>
                <p>
                  Founded by a collective of students and faculty, our platform was engineered to serve as the beating heart of campus life. We bridge the gap between students, staff, and industry partners, creating a friction-free ecosystem where innovation is only one click away.
                </p>
              </div>

              {/* Supported Institutes */}
              <div className="pt-6 border-t border-slate-200">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Uniting the CADT Ecosystem</p>
                <div className="flex flex-wrap gap-3">
                   {institutes.map(inst => (
                     <div key={inst.abbr} className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm hover:border-[#0b2c6a]/30 hover:shadow-md transition-all cursor-default" title={inst.name}>
                        <div className="text-[#0b2c6a]">{inst.icon}</div>
                        <span className="text-sm font-bold text-slate-700">{inst.abbr}</span>
                     </div>
                   ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* =======================================================================
          PILLARS (Glassmorphic Grid)
         ======================================================================= */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        {/* Background mesh */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-black text-amber-400 tracking-widest uppercase mb-3">Core Values</h2>
            <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              The foundation of our platform.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((pillar, idx) => (
              <div key={idx} className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 backdrop-blur-md overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-amber-400/20 transition-colors" />
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform duration-300">
                  {pillar.icon}
                </div>
                <h4 className="text-xl font-bold text-white mb-3">{pillar.title}</h4>
                <p className="text-slate-300 text-sm leading-relaxed">{pillar.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =======================================================================
          THE TEAM (Premium Cards)
         ======================================================================= */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-black text-amber-500 tracking-widest uppercase mb-3">Project Team</h2>
            <h3 className="text-3xl md:text-4xl font-black text-[#0b2c6a] tracking-tight leading-tight">
              Meet the creators behind the platform.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {team.map((member, idx) => (
              <div key={idx} className="group flex flex-col items-center text-center">
                <div className="relative mb-6">
                  {/* Decorative outer ring */}
                  <div className="absolute -inset-1 bg-gradient-to-tr from-amber-300 to-[#0b2c6a] rounded-full opacity-0 group-hover:opacity-100 blur transition-opacity duration-500" />
                  <div className="relative w-40 h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100 z-10 transform transition-transform duration-500 group-hover:scale-[1.02]">
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover object-top" />
                  </div>
                  {/* Floating role badge */}
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#0b2c6a] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full z-20 shadow-lg opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-300">
                    {member.role}
                  </div>
                </div>
                
                <h4 className="text-xl font-black text-slate-900 tracking-tight mb-1">{member.name}</h4>
                <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-4">{member.role}</p>
                <p className="text-sm text-slate-500 max-w-xs leading-relaxed">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =======================================================================
          CTA SECTION
         ======================================================================= */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-[#0b2c6a] mb-6">Ready to join the vibrant CADT community?</h2>
          <button 
            onClick={onExploreEventsClick}
            className="px-8 py-4 bg-[#0b2c6a] hover:bg-[#082050] text-white text-sm font-black tracking-wide uppercase rounded-xl shadow-xl shadow-[#0b2c6a]/20 transition-all active:scale-[0.98]"
          >
            Discover Upcoming Events
          </button>
        </div>
      </section>
      
    </div>
  );
}