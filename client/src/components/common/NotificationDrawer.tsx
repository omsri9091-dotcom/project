import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import { Bell, Check, ExternalLink, X, AlertTriangle, Info, CheckCircle2, AlertOctagon } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationDrawer: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isDrawerOpen, setIsDrawerOpen } = useNotification();

  if (!isDrawerOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CRITICAL':
        return <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      case 'SUCCESS':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-indigo-400 shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0d1527] border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Notifications & Alerts</h3>
                <p className="text-xs text-slate-400">{unreadCount} unread notification{unreadCount === 1 ? '' : 's'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium px-2.5 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Bell className="w-12 h-12 stroke-1 mb-3 opacity-40" />
                <p className="text-sm font-medium text-slate-400">All caught up!</p>
                <p className="text-xs text-slate-500 mt-1">No pending notifications at this time.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-3.5 rounded-xl border transition-all duration-200 ${
                    notif.read
                      ? 'bg-slate-900/40 border-slate-800/80 text-slate-300'
                      : 'bg-indigo-950/20 border-indigo-500/30 text-white shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getTypeIcon(notif.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold text-white truncate">{notif.title}</h4>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                      
                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/50">
                        <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <div className="flex items-center gap-2">
                          {notif.link && (
                            <Link
                              to={notif.link}
                              onClick={() => {
                                markAsRead(notif._id);
                                setIsDrawerOpen(false);
                              }}
                              className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                            >
                              View details <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                          {!notif.read && (
                            <button
                              onClick={() => markAsRead(notif._id)}
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                              title="Mark as read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
