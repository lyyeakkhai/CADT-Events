import { School } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full mt-12 bg-primary text-white border-t border-primary-container">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-6 py-12 max-w-7xl mx-auto">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white">
              <School size={20} />
            </span>
            <span className="text-xl font-bold tracking-tight">CADT Event Central</span>
          </div>
          <p className="text-sm text-white/70 max-w-xs leading-relaxed">
            Elevating educational experiences through streamlined management and innovative professional event planning.
          </p>
        </div>
        
        <div className="flex flex-col gap-3">
          <span className="text-sm font-bold uppercase tracking-widest text-white/50 mb-2">Quick Access</span>
          <a href="#" className="text-sm hover:text-white/70 transition-colors">Support Desk</a>
          <a href="#" className="text-sm hover:text-white/70 transition-colors">Privacy Governance</a>
          <a href="#" className="text-sm hover:text-white/70 transition-colors">Institutional Terms</a>
          <a href="#" className="text-sm hover:text-white/70 transition-colors">Global Directory</a>
        </div>
        
        <div className="flex flex-col gap-3">
          <span className="text-sm font-bold uppercase tracking-widest text-white/50 mb-2">Infrastructure</span>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary shadow-[0_0_10px_rgba(0,108,73,0.8)]"></span>
            <span className="text-sm font-medium">Network Operational</span>
          </div>
          <div className="mt-4 text-xs text-white/40 leading-relaxed">
            © 2024 Cambodia Academy of Digital Technology.<br/>All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
