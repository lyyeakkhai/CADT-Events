import type { ViewType } from '../App';
import { ChevronRight, CheckSquare, Filter, Calendar as CalIcon, Eye, FileText, Table, FileBox, Info, Rocket, DownloadCloud } from 'lucide-react';

export default function ExportView({ onNavigate }: { onNavigate: (v: ViewType) => void }) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-6 w-full fade-in">
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-3">
          <button onClick={() => onNavigate('dashboard')} className="hover:text-primary">Admin Dashboard</button>
          <ChevronRight size={14} />
          <span>Tech Innovators Summit</span>
          <ChevronRight size={14} />
          <span className="text-primary font-bold">Export Details</span>
        </nav>
        <h1 className="text-3xl font-bold text-on-surface">Export Event Data</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8 flex flex-col gap-6">
          {/* Data Selection */}
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/50 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-outline-variant/30">
              <CheckSquare className="text-primary" size={20} />
              <h2 className="text-lg font-bold text-on-surface">Data Selection</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                { title: "EVENT INFORMATION", items: [{n: "Event ID", c: true}, {n: "Title", c: true}, {n: "Date", c: true}, {n: "Venue", c: false}] },
                { title: "REGISTRATION LIST", items: [{n: "Student Name", c: true}, {n: "ID Number", c: true}, {n: "Email", c: true}, {n: "Department", c: false}] },
                { title: "STATISTICS", items: [{n: "Total Attendance", c: true}, {n: "Utilization Rate", c: false}] }
              ].map((group, i) => (
                <div key={i} className="space-y-3">
                  <h3 className="text-xs font-bold text-outline uppercase tracking-wider mb-4">{group.title}</h3>
                  {group.items.map((item, j) => (
                    <label key={j} className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" defaultChecked={item.c} className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20 accent-primary" />
                      <span className="text-sm text-on-surface group-hover:text-primary transition-colors">{item.n}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </section>

          {/* Filter Options */}
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/50 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-outline-variant/30">
              <Filter className="text-primary" size={20} />
              <h2 className="text-lg font-bold text-on-surface">Filter Options</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface-variant">Registration Status</label>
                <select className="w-full bg-surface-container-lowest border border-outline-variant/80 rounded-lg p-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50">
                  <option>All Statuses</option>
                  <option>Active</option>
                  <option>Waitlisted</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface-variant">Date Range</label>
                <div className="relative">
                  <CalIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={16} />
                  <input type="text" defaultValue="Oct 01, 2024 - Oct 25, 2024" className="w-full pl-9 pr-3 py-2.5 bg-surface-container-lowest border border-outline-variant/80 rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50" />
                </div>
              </div>
            </div>
          </section>

          {/* Preview Table */}
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/50 shadow-sm overflow-hidden flex flex-col flex-grow">
            <div className="p-5 flex justify-between items-center bg-surface-container-low/30 border-b border-outline-variant/30">
              <div className="flex items-center gap-2">
                <Eye className="text-primary" size={20} />
                <h2 className="text-lg font-bold text-on-surface">Data Preview (Sample)</h2>
              </div>
              <span className="text-xs text-on-surface-variant bg-white px-3 py-1 rounded-full border border-outline-variant/30">5 of 1240 rows</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/30 text-on-surface-variant border-b border-outline-variant/30">
                    <th className="px-5 py-3 text-sm font-semibold">Student Name</th>
                    <th className="px-5 py-3 text-sm font-semibold">ID Number</th>
                    <th className="px-5 py-3 text-sm font-semibold">Department</th>
                    <th className="px-5 py-3 text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {[
                    { n: "Alex Johnson", id: "ID-2024-001", d: "Computer Science" },
                    { n: "Maria Garcia", id: "ID-2024-042", d: "Digital Media" },
                    { n: "Sovanrath Chen", id: "ID-2024-118", d: "Cybersecurity" },
                    { n: "James Smith", id: "ID-2024-009", d: "Data Science" },
                    { n: "Srey Nich", id: "ID-2024-088", d: "Cloud Architecture" }
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="px-5 py-3 text-sm">{row.n}</td>
                      <td className="px-5 py-3 text-sm text-on-surface-variant">{row.id}</td>
                      <td className="px-5 py-3 text-sm">{row.d}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center justify-center bg-secondary-container/50 text-on-secondary-container px-2 py-0.5 rounded-full text-[10px] font-bold border border-secondary/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1 animate-pulse"></span>
                          ACTIVE
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="md:col-span-4 flex flex-col gap-6">
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/50 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-outline-variant/30">
              <DownloadCloud className="text-primary" size={20} />
              <h2 className="text-lg font-bold text-on-surface">Export Format</h2>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 border border-outline-variant/50 rounded-lg cursor-pointer hover:bg-surface-container transition-all group">
                <div className="flex items-center gap-3">
                  <FileText className="text-outline group-hover:text-primary" size={20} />
                  <span className="text-sm">CSV (.csv)</span>
                </div>
                <input type="radio" name="fmt" className="w-4 h-4 text-primary accent-primary" />
              </label>
              <label className="flex items-center justify-between p-3.5 border-2 border-primary bg-primary/5 rounded-lg cursor-pointer transition-all group">
                <div className="flex items-center gap-3">
                  <Table className="text-primary" size={20} />
                  <span className="text-sm font-bold text-primary">Excel (.xlsx)</span>
                </div>
                <input type="radio" name="fmt" defaultChecked className="w-4 h-4 text-primary accent-primary" />
              </label>
              <label className="flex items-center justify-between p-3.5 border border-outline-variant/50 rounded-lg cursor-pointer hover:bg-surface-container transition-all group">
                <div className="flex items-center gap-3">
                  <FileBox className="text-outline group-hover:text-error" size={20} />
                  <span className="text-sm">PDF Document</span>
                </div>
                <input type="radio" name="fmt" className="w-4 h-4 text-primary accent-primary" />
              </label>
            </div>
          </section>

          <div className="flex flex-col gap-3">
            <button className="w-full py-3.5 bg-primary-container text-white font-bold rounded-lg shadow hover:bg-primary transition-all flex items-center justify-center gap-2">
              <Rocket size={18} />
              Generate Export
            </button>
            <button className="w-full py-3 text-primary font-bold rounded-lg border-2 border-primary hover:bg-primary/5 transition-all">
              Cancel
            </button>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex gap-3">
            <Info className="text-primary shrink-0" size={20} />
            <div>
              <h4 className="text-sm font-bold text-primary mb-1">Pro-Tip</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                For datasets larger than 5,000 records, the generation process may take up to 2 minutes. We will notify you via the notification center once your file is ready for download.
              </p>
            </div>
          </div>
          
          <div className="rounded-xl overflow-hidden shadow-sm relative h-40">
             <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover" alt="Analytics Promo" />
             <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent flex items-end p-4">
               <p className="text-white text-xs font-medium">Detailed analytics are also available in the Dashboard section.</p>
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
