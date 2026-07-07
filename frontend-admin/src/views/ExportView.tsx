import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, CheckSquare, Filter, Calendar as CalIcon, Eye, FileText, Table, FileBox, Info, Rocket, DownloadCloud, Loader2 } from 'lucide-react';
import apiClient from '../lib/apiClient';
import { exportToCSV, exportToExcel, exportToPDF } from '../lib/exportUtils';
import type { ExportDataRow } from '../lib/exportUtils';

export default function ExportView() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [format, setFormat] = useState<'csv' | 'xlsx' | 'pdf'>('xlsx');
  
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    
    // Simulate fetching registration data
    // Replace this with a real endpoint (e.g. `/events/:id/registrations`) once backend supports it
    setTimeout(() => {
      if (active) {
        setData([
          { id: "ID-2024-001", name: "Alex Johnson", email: "alex@example.com", department: "Computer Science", status: "ACTIVE" },
          { id: "ID-2024-042", name: "Maria Garcia", email: "maria@example.com", department: "Digital Media", status: "ACTIVE" },
          { id: "ID-2024-118", name: "Sovanrath Chen", email: "sovanrath@example.com", department: "Cybersecurity", status: "WAITLISTED" },
          { id: "ID-2024-009", name: "James Smith", email: "james@example.com", department: "Data Science", status: "ACTIVE" },
          { id: "ID-2024-088", name: "Srey Nich", email: "srey@example.com", department: "Cloud Architecture", status: "ACTIVE" }
        ]);
        setLoading(false);
      }
    }, 800);

    return () => { active = false; };
  }, []);

  const handleExport = async () => {
    setGenerating(true);
    
    // In a production scenario, you would fetch the full dataset without pagination here
    // based on the selected filters.
    
    const exportData: ExportDataRow[] = data.map(item => ({
      "ID Number": item.id,
      "Student Name": item.name,
      "Email": item.email,
      "Department": item.department,
      "Status": item.status
    }));

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Event_Export_${timestamp}`;
    
    try {
      if (format === 'csv') {
        exportToCSV(exportData, filename);
      } else if (format === 'xlsx') {
        exportToExcel(exportData, filename);
      } else if (format === 'pdf') {
        exportToPDF(exportData, 'Event Registration Export', filename);
      }
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setTimeout(() => setGenerating(false), 500);
    }
  };

  return (
    <div className="w-full px-6 py-6 fade-in max-w-7xl mx-auto">
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-3 font-medium">
          <button onClick={() => navigate('/')} className="hover:text-amber-500 transition-colors">Admin Dashboard</button>
          <ChevronRight size={14} className="text-slate-400" />
          <span>Tech Innovators Summit</span>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="text-amber-500 font-bold">Export Details</span>
        </nav>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Export Event Data</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 flex flex-col gap-6">
          {/* Data Selection */}
          <section className="glass-card p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <CheckSquare className="text-amber-500" size={20} />
              <h2 className="text-lg font-bold text-slate-900">Data Selection</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                { title: "EVENT INFORMATION", items: [{n: "Event ID", c: true}, {n: "Title", c: true}, {n: "Date", c: true}, {n: "Venue", c: false}] },
                { title: "REGISTRATION LIST", items: [{n: "Student Name", c: true}, {n: "ID Number", c: true}, {n: "Email", c: true}, {n: "Department", c: false}] },
                { title: "STATISTICS", items: [{n: "Total Attendance", c: true}, {n: "Utilization Rate", c: false}] }
              ].map((group, i) => (
                <div key={i} className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">{group.title}</h3>
                  {group.items.map((item, j) => (
                    <label key={j} className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" defaultChecked={item.c} className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-amber-400/30 accent-amber-500" />
                      <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">{item.n}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </section>

          {/* Filter Options */}
          <section className="glass-card p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <Filter className="text-blue-500" size={20} />
              <h2 className="text-lg font-bold text-slate-900">Filter Options</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Registration Status</label>
                <select className="w-full input-glow p-2.5 text-sm outline-none transition-all cursor-pointer">
                  <option>All Statuses</option>
                  <option>Active</option>
                  <option>Waitlisted</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Date Range</label>
                <div className="relative">
                  <CalIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" defaultValue="Oct 01, 2024 - Oct 25, 2024" className="w-full pl-9 pr-3 py-2.5 input-glow text-sm outline-none transition-all" />
                </div>
              </div>
            </div>
          </section>

          {/* Preview Table */}
          <section className="glass-card overflow-hidden flex flex-col flex-grow min-h-[300px]">
            <div className="p-5 flex justify-between items-center bg-slate-50/50 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Eye className="text-emerald-500" size={20} />
                <h2 className="text-lg font-bold text-slate-900">Data Preview (Sample)</h2>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">5 of 1240 rows</span>
            </div>
            <div className="overflow-x-auto flex-grow">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-500 border-b border-slate-100">
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider">Student Name</th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider">ID Number</th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider">Department</th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-12 text-center text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-slate-300" />
                        <span className="text-sm font-medium">Loading preview data...</span>
                      </td>
                    </tr>
                  ) : (
                    data.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors bg-white">
                        <td className="px-5 py-3.5 text-sm font-medium text-slate-900">{row.name}</td>
                        <td className="px-5 py-3.5 text-sm text-slate-500 font-mono">{row.id}</td>
                        <td className="px-5 py-3.5 text-sm text-slate-600">{row.department}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${row.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${row.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="xl:col-span-4 flex flex-col gap-6">
          <section className="glass-card p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <DownloadCloud className="text-purple-500" size={20} />
              <h2 className="text-lg font-bold text-slate-900">Export Format</h2>
            </div>
            <div className="space-y-3">
              <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all group ${format === 'csv' ? 'border-amber-500 bg-amber-50/30 shadow-sm' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                <div className="flex items-center gap-3">
                  <FileText className={format === 'csv' ? 'text-amber-600' : 'text-slate-400 group-hover:text-slate-600'} size={20} />
                  <span className={`text-sm ${format === 'csv' ? 'font-bold text-amber-900' : 'font-medium text-slate-700'}`}>CSV (.csv)</span>
                </div>
                <input type="radio" name="fmt" checked={format === 'csv'} onChange={() => setFormat('csv')} className="w-4 h-4 text-amber-500 accent-amber-500" />
              </label>
              <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all group ${format === 'xlsx' ? 'border-amber-500 bg-amber-50/30 shadow-sm' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                <div className="flex items-center gap-3">
                  <Table className={format === 'xlsx' ? 'text-amber-600' : 'text-slate-400 group-hover:text-slate-600'} size={20} />
                  <span className={`text-sm ${format === 'xlsx' ? 'font-bold text-amber-900' : 'font-medium text-slate-700'}`}>Excel (.xlsx)</span>
                </div>
                <input type="radio" name="fmt" checked={format === 'xlsx'} onChange={() => setFormat('xlsx')} className="w-4 h-4 text-amber-500 accent-amber-500" />
              </label>
              <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all group ${format === 'pdf' ? 'border-amber-500 bg-amber-50/30 shadow-sm' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                <div className="flex items-center gap-3">
                  <FileBox className={format === 'pdf' ? 'text-amber-600' : 'text-slate-400 group-hover:text-slate-600'} size={20} />
                  <span className={`text-sm ${format === 'pdf' ? 'font-bold text-amber-900' : 'font-medium text-slate-700'}`}>PDF Document</span>
                </div>
                <input type="radio" name="fmt" checked={format === 'pdf'} onChange={() => setFormat('pdf')} className="w-4 h-4 text-amber-500 accent-amber-500" />
              </label>
            </div>
          </section>

          <div className="flex flex-col gap-3">
            <button 
              onClick={handleExport}
              disabled={generating || loading}
              className="w-full py-4 bg-amber-500 text-white font-bold rounded-xl shadow-md hover:bg-amber-600 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {generating ? (
                <><Loader2 size={18} className="animate-spin" /> Generating...</>
              ) : (
                <><Rocket size={18} /> Generate Export</>
              )}
            </button>
            <button className="w-full py-3.5 text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all">
              Cancel
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex gap-3">
            <Info className="text-blue-500 shrink-0" size={20} />
            <div>
              <h4 className="text-sm font-bold text-blue-900 mb-1">Pro-Tip</h4>
              <p className="text-xs text-blue-700/80 leading-relaxed font-medium">
                For datasets larger than 5,000 records, the generation process may take up to 2 minutes. We will notify you via the notification center once your file is ready for download.
              </p>
            </div>
          </div>
          
          <div className="rounded-xl overflow-hidden shadow-sm relative h-40">
             <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover" alt="Analytics Promo" />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent flex items-end p-5">
               <p className="text-white text-xs font-medium leading-relaxed">Detailed analytics are also available in the <strong className="text-amber-400">Dashboard</strong> section.</p>
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
