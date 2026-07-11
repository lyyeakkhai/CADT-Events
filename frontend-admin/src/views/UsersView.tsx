import { useState } from 'react';
import { Search, MoreHorizontal, Shield, User, Filter, UserPlus } from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  eventsJoined: number;
  totalCredits: number;
  role: 'admin' | 'user';
  joinDate: string;
}

const mockUsers: UserData[] = [
  { id: '1', name: 'John Doe', email: 'john.doe@example.com', eventsJoined: 12, totalCredits: 45, role: 'user', joinDate: '2023-01-15' },
  { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', eventsJoined: 8, totalCredits: 30, role: 'user', joinDate: '2023-03-22' },
  { id: '3', name: 'Admin User', email: 'admin@cadt.edu.kh', eventsJoined: 42, totalCredits: 150, role: 'admin', joinDate: '2022-11-01' },
  { id: '4', name: 'Michael Chen', email: 'michael.chen@example.com', eventsJoined: 3, totalCredits: 10, role: 'user', joinDate: '2023-08-05' },
  { id: '5', name: 'Sarah Jones', email: 'sarah.j@example.com', eventsJoined: 15, totalCredits: 60, role: 'user', joinDate: '2023-02-10' },
  { id: '6', name: 'David Kim', email: 'david.k@example.com', eventsJoined: 1, totalCredits: 5, role: 'user', joinDate: '2023-09-12' },
  { id: '7', name: 'Emily Davis', email: 'emily.d@example.com', eventsJoined: 5, totalCredits: 20, role: 'user', joinDate: '2023-05-18' },
];

export default function UsersView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');

  const filteredUsers = mockUsers
    .filter(u => roleFilter === 'all' ? true : u.role === roleFilter)
    .filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="p-8 w-full min-h-screen text-slate-900 animate-fade-in font-sans">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900 mb-2 tracking-tight">User Management</h1>
          <p className="text-sm text-slate-500">View and manage all registered users and their event participation.</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
          <UserPlus size={16} />
          Add User
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="relative w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-[8px] text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all placeholder:text-slate-400 text-slate-700 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-[8px] p-1 shadow-sm">
          <button 
            onClick={() => setRoleFilter('all')}
            className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors ${roleFilter === 'all' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            All
          </button>
          <button 
            onClick={() => setRoleFilter('user')}
            className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors ${roleFilter === 'user' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Students
          </button>
          <button 
            onClick={() => setRoleFilter('admin')}
            className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors ${roleFilter === 'admin' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Admins
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="p-4 pl-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Events Joined</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Credits Earned</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined Date</th>
                <th className="p-4 pr-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{user.name}</p>
                          <p className="text-slate-500 text-[13px]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {user.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200/50">
                          <Shield size={12} /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/50">
                          <User size={12} /> Student
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm font-medium text-slate-900">{user.eventsJoined}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm font-bold text-indigo-600">{user.totalCredits}</span>
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {new Date(user.joinDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                        <User size={24} className="text-slate-300" />
                      </div>
                      <h3 className="text-base font-medium text-slate-900 mb-1">No users found</h3>
                      <p className="text-sm text-slate-500">Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
