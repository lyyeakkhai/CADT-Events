import { useState, useEffect } from 'react';
import { Search, Shield, User, UserPlus, Loader2, X, CheckCircle2, AlertCircle } from 'lucide-react';
import apiClient from '../lib/apiClient';

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

export default function UsersView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'user' | 'admin'>('user');
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<string | null>(null);
  const [inviteErr, setInviteErr] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get('/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users
    .filter((u) => (roleFilter === 'all' ? true : u.role === roleFilter))
    .filter(
      (u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleInvite = async () => {
    setInviteErr(null);
    setInviteMsg(null);
    if (!inviteEmail.trim()) {
      setInviteErr('Email is required');
      return;
    }
    setInviting(true);
    try {
      const res = await apiClient.post('/users/invite', {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      setInviteMsg(res.data?.message || `Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setTimeout(() => {
        setShowInvite(false);
        setInviteMsg(null);
      }, 2000);
    } catch (err: any) {
      setInviteErr(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Failed to send invitation'
      );
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 w-full min-h-screen text-slate-900 animate-fade-in font-sans">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900 mb-2 tracking-tight">
            User Management
          </h1>
          <p className="text-sm text-slate-500">
            View registered users and invite new accounts via Clerk.
          </p>
        </div>

        <button
          onClick={() => {
            setShowInvite(true);
            setInviteErr(null);
            setInviteMsg(null);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm w-full sm:w-auto"
        >
          <UserPlus size={16} />
          Add User
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div className="relative w-full sm:w-[320px]">
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
                <th className="p-4 pl-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  User
                </th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                  Events Joined
                </th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                  Credits Earned
                </th>
                <th className="p-4 pr-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Joined Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                      <p>Loading users...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
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
                    <td className="p-4 pr-6 text-sm text-slate-500">
                      {new Date(user.joinDate).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
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

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowInvite(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
            >
              <X size={18} />
            </button>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Invite user</h2>
            <p className="text-sm text-slate-500 mb-4">
              Sends a real Clerk invitation email. Admin invites require the email to be listed in
              server <code className="text-xs bg-slate-100 px-1 rounded">ADMIN_EMAILS</code>.
            </p>

            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="student@cadt.edu.kh"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />

            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'user' | 'admin')}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="user">Student</option>
              <option value="admin">Admin / Teacher</option>
            </select>

            {inviteErr && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3 mb-3">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                {inviteErr}
              </div>
            )}
            {inviteMsg && (
              <div className="flex items-start gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-3 mb-3">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                {inviteMsg}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowInvite(false)}
                className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={inviting}
                onClick={handleInvite}
                className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
              >
                {inviting && <Loader2 size={14} className="animate-spin" />}
                Send invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
