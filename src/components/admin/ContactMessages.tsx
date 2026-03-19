import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Mail, Calendar, Eye, EyeOff } from "lucide-react";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export const ContactMessages = () => {
  const [messages, setMessages] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error("Failed to fetch contact messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRead = async (id: string, currentStatus: boolean) => {
    try {
      await (supabase as any)
        .from('contact_submissions')
        .update({ is_read: !currentStatus })
        .eq('id', id);
      
      setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: !currentStatus } : m));
    } catch (err) {
      console.error("Failed to update read status:", err);
    }
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[hsl(45,76%,52%)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="admin-glass-panel p-6">
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Total Messages</p>
          <p className="text-2xl font-bold">{messages.length}</p>
        </div>
        <div className="admin-glass-panel p-6">
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Unread</p>
          <p className="text-2xl font-bold text-[hsl(45,76%,52%)]">{unreadCount}</p>
        </div>
        <div className="admin-glass-panel p-6">
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Read</p>
          <p className="text-2xl font-bold">{messages.length - unreadCount}</p>
        </div>
      </div>

      {/* Messages list */}
      <div className="admin-glass-panel overflow-hidden">
        {messages.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="h-10 w-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No contact messages yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {messages.map((msg) => (
              <div key={msg.id} className={`p-5 transition-colors ${!msg.is_read ? 'bg-[hsl(45,76%,52%,0.03)]' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedId(expandedId === msg.id ? null : msg.id)}>
                    <div className="flex items-center gap-3 mb-1">
                      {!msg.is_read && <span className="size-2 rounded-full bg-[hsl(45,76%,52%)] flex-shrink-0" />}
                      <p className="text-sm font-bold text-white truncate">{msg.name}</p>
                      <span className="text-[10px] text-white/30">•</span>
                      <p className="text-[11px] text-white/40 truncate">{msg.email}</p>
                    </div>
                    <p className="text-xs font-semibold text-white/70 mb-1">{msg.subject}</p>
                    {expandedId !== msg.id && (
                      <p className="text-xs text-white/40 truncate">{msg.message}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[10px] text-white/30">
                      {new Date(msg.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <button
                      onClick={() => toggleRead(msg.id, msg.is_read)}
                      className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                      title={msg.is_read ? "Mark as unread" : "Mark as read"}
                    >
                      {msg.is_read ? (
                        <EyeOff className="h-3.5 w-3.5 text-white/30" />
                      ) : (
                        <Eye className="h-3.5 w-3.5 text-[hsl(45,76%,52%)]" />
                      )}
                    </button>
                  </div>
                </div>
                {expandedId === msg.id && (
                  <div className="mt-3 p-4 bg-white/5 rounded-lg border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="h-3.5 w-3.5 text-[hsl(45,76%,52%)]" />
                      <a href={`mailto:${msg.email}`} className="text-xs text-[hsl(45,76%,52%)] hover:underline">{msg.email}</a>
                      <span className="text-white/20">•</span>
                      <Calendar className="h-3.5 w-3.5 text-white/30" />
                      <span className="text-[10px] text-white/30">
                        {new Date(msg.created_at).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
