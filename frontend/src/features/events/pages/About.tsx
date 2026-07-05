import React from 'react';
import Yeakkhai from '../../../assets/images/Yeakkhai.png';
import Cheata from '../../../assets/images/Cheata.png';
import Nolly from '../../../assets/images/Nolly.png';
import Group from '../../../assets/images/Group.png';
import IDRI from '../../../assets/images/innovationcenter.png';
interface AboutProps {
  onExploreEventsClick: () => void;
}

export default function About({ onExploreEventsClick }: AboutProps) {

  const leadershipTeam = [
    {
      name: "Ly Yeakkhai",
      role: "CEO",
      image: Yeakkhai
    },
    {
      name: "Thoung Socheata",
      role: "HEAD OF CONTENT",
      image: Cheata
    },
    {
      name: "So Channolly",
      role: "TECHNICAL LEAD",
      image: Nolly
    }
  ];

  // 2. Pillars Information Core Matrices row layout specifications
  const missionPillars = [
    { icon: "♿", title: "Accessibility", text: "Removing barriers to entry so every participant, regardless of background, can engage fully with academic offerings." },
    { icon: "👥", title: "Diversity", text: "Curating a spectrum of events that reflect the global perspective and diverse interests of our community." },
    { icon: "🧑‍🤝‍🧑", title: "Community", text: "Fostering deep connections between learners and mentors through shared experiences and collaborative learning." }
  ];

  // 3. Core Values Grid metrics blocks data mapping loop values
  const coreValues = [
    { icon: "💡", title: "Innovation", text: "We embrace the new, constantly seeking better ways to connect our community and showcase brilliant ideas." },
    { icon: "🛡️", title: "Integrity", text: "Honesty and transparency are the bedrock of our platform, ensuring a trusted environment for all users." },
    { icon: "❤️", title: "Passion", text: "We are driven by a deep love for education and a desire to see every student and faculty member succeed." }
  ];

  return (
    <div className="w-full bg-[#f8fafc] flex flex-col font-sans antialiased text-slate-900 animate-fade-in">
      
      {/* =======================================================================
          SECTION 1: HERO DISPLAY BANNER (Matches top of image_37cae3.png)
         ======================================================================= */}
      <section className="relative w-full h-[380px] md:h-[440px] overflow-hidden bg-slate-950 flex items-center">
        {/* Background Image Layer Accent */}
        <div className="absolute inset-0 z-0">
          <img 
            src={IDRI}
            alt="CADT Campus Architecture background framework" 
            className="w-full h-full object-cover opacity-25 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
        </div>

        {/* Content Box Overlay */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 text-left space-y-4">
          
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none">
            About CADT Event
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm font-semibold max-w-xl leading-relaxed">
            Revolutionizing the academic event experience through a unified digital platform designed for the modern scholar.
          </p>
          
          <div className="flex items-center gap-3 pt-2">
            <button 
              onClick={onExploreEventsClick}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-extrabold rounded-md shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              Explore Events
            </button>
            <button 
              onClick={() => {
                document.getElementById('story-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-2.5 bg-transparent hover:bg-white/10 text-white text-xs font-bold rounded-md border border-white/30 transition-all cursor-pointer"
            >
              Our Story
            </button>
          </div>
        </div>
      </section>

      {/* =======================================================================
          SECTION 2: OUR STORY LAYOUT (Split Row Matrix Layout with Asset box)
         ======================================================================= */}
      <section id="story-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Informational Typography Block */}
        <div className="lg:col-span-7 space-y-5 text-left">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight relative pb-1 inline-block">
            Our Story
            <span className="absolute bottom-0 left-0 w-8 h-1 bg-amber-400 rounded-full" />
          </h2>
          <div className="space-y-4 text-xs sm:text-sm font-medium text-slate-500 leading-relaxed">
            <p>
              CADT Event was born out of a simple observation: the vibrant life of our institution was often hidden behind fragmented communication channels and paper posters. We saw brilliant guest lectures with empty seats and student-led workshops that struggled to find their audience.
            </p>
            <p>
              Founded by a collective of students and faculty, our platform was engineered to serve as the beating heart of campus life. We bridge the gap between students, staff, and industry partners, creating a friction-free ecosystem where innovation is only one click away.
            </p>
            <p>
              Today, we stand as the primary hub for intellectual exchange, professional networking, and community building, ensuring that no opportunity for growth goes unnoticed.
            </p>
          </div>
        </div>

        {/* Right Frame Showcase Graphic (With gold outline offset effect matching your figma wireframe card style) */}
        <div className="lg:col-span-5 relative group flex justify-center py-4">
          <div className="absolute right-4 bottom-0 w-[92%] h-[92%] border-4 border-amber-400 rounded-xl z-0" />
          <div className="relative z-10 w-[92%] h-64 sm:h-72 rounded-xl overflow-hidden shadow-lg border border-slate-200">
            <img 
              src={Group}
              alt="CADT Team active design workshop execution sessions logs" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
            />
          </div>
        </div>

      </section>

      {/* =======================================================================
          SECTION 3: LEADERSHIP TEAM GRID (Matches middle section of image_37cae3.png)
         ======================================================================= */}
      <section className="w-full bg-slate-50 border-t border-b border-slate-200/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10 w-full">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
              Leadership Team
            </h2>
            <p className="text-xs font-semibold text-slate-400">
              The visionaries behind CADT Event, dedicated to fostering the next generation of academic networking.
            </p>
          </div>

          {/* 3-Column Profile Cards Grid layout */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
            {leadershipTeam.map((member, idx) => (
              <div key={idx} className="bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col items-center p-5 text-center group">
                <div className="w-28 h-28 rounded-full border border-slate-200 shadow-inner bg-slate-50 overflow-hidden mb-4 transition-transform duration-300 group-hover:scale-105">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover object-top" />
                </div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1">
                  {member.name}
                </h3>
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-wider">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =======================================================================
          SECTION 4: THE MISSION STATEMENT STATEMENT ROW BLOCK
         ======================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center w-full space-y-10">
        <div className="max-w-3xl mx-auto space-y-2 select-none">
          <span className="text-[10px] font-black tracking-widest text-amber-600 uppercase">
            THE MISSION
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-normal italic leading-relaxed">
            "One platform, endless opportunities. We clear the noise and bring all CADT events together, making it simple for you to discover what's happening on campus."
          </h2>
        </div>

        {/* Dynamic 3-Column Cards Rows mapping component */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {missionPillars.map((pillar, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-xl p-5 shadow-3xs flex flex-col items-center text-center space-y-2.5">
              <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-lg shadow-3xs border border-slate-100/50">
                {pillar.icon}
              </div>
              <h4 className="text-xs font-black text-slate-900 tracking-tight uppercase">
                {pillar.title}
              </h4>
              <p className="text-[11px] font-medium text-slate-400 leading-relaxed max-w-[220px]">
                {pillar.text}
              </p>
            </div>
          ))}
        </div>
      </section>

     

    </div>
  );
}