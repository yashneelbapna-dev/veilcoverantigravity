import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Eye, X, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatLog {
  id: string;
  user_id: string | null;
  session_id: string | null;
  user_message: string;
  bot_reply: string;
  created_at: string;
}

interface GroupedSession {
  sessionId: string;
  userId: string | null;
  email: string | null;
  messages: ChatLog[];
  firstMessage: string;
  messageCount: number;
  date: string;
}

export const ChatLogs = () => {
  const [sessions, setSessions] = useState<GroupedSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<GroupedSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("chat_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (!data) { setLoading(false); return; }

    // Group by session
    const map = new Map<string, ChatLog[]>();
    for (const log of data) {
      const key = log.session_id || log.id;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(log);
    }

    const grouped: GroupedSession[] = [];
    for (const [sessionId, msgs] of map) {
      msgs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      grouped.push({
        sessionId,
        userId: msgs[0].user_id,
        email: null,
        messages: msgs,
        firstMessage: msgs[0].user_message.slice(0, 60),
        messageCount: msgs.length,
        date: msgs[0].created_at,
      });
    }
    grouped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setSessions(grouped);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-[hsl(45,76%,52%)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (selectedSession) {
    return (
      <div className="admin-glass-panel overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedSession(null)}
            className="text-white/50 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h3 className="text-sm font-bold text-white">
            Session: {selectedSession.sessionId.slice(0, 8)}…
          </h3>
          <span className="text-[10px] text-white/30 ml-auto">
            {selectedSession.userId ? `User: ${selectedSession.userId.slice(0, 8)}…` : "Guest"}
          </span>
        </div>
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {selectedSession.messages.map((msg) => (
            <div key={msg.id} className="space-y-2">
              <div className="flex justify-end">
                <div className="bg-[#C9A96E] text-black rounded-[16px_16px_4px_16px] px-4 py-2 max-w-[80%] text-sm">
                  {msg.user_message}
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-white/5 text-white/80 rounded-[4px_16px_16px_16px] px-4 py-2 max-w-[80%] text-sm whitespace-pre-wrap">
                  {msg.bot_reply}
                </div>
              </div>
              <p className="text-[10px] text-white/20 text-center">
                {new Date(msg.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-glass-panel overflow-hidden">
      <div className="p-8 border-b border-white/5 flex items-center gap-3">
        <MessageSquare className="h-5 w-5 text-[hsl(45,76%,52%)]" />
        <h3 className="text-lg font-bold">Chat Logs</h3>
        <span className="text-[10px] font-bold text-white/40 bg-white/5 px-3 py-1 rounded-full uppercase tracking-widest">
          {sessions.length} sessions
        </span>
      </div>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>First Message</th>
              <th>Messages</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.sessionId}>
                <td className="text-xs">{s.userId ? s.userId.slice(0, 8) + "…" : "Guest"}</td>
                <td className="text-xs max-w-[200px] truncate">{s.firstMessage}</td>
                <td className="text-xs text-center">{s.messageCount}</td>
                <td className="text-xs text-white/40">
                  {new Date(s.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedSession(s)}
                    className="text-[hsl(45,76%,52%)] hover:text-white text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" /> View
                  </Button>
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-white/30 py-12 text-sm">
                  No chat logs yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
