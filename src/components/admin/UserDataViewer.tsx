import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuditLog } from "@/hooks/useAuditLog";
import {
  Database,
  User,
  ShoppingCart,
  Heart,
  Settings,
  ClipboardList,
  RefreshCw,
  FileJson,
  FolderOpen,
  AlertCircle,
} from "lucide-react";

interface UserFolder {
  userId: string;
  files: string[];
  email?: string;
}

interface FileContent {
  name: string;
  content: unknown;
  error?: string;
}

const FILE_ICONS: Record<string, React.ReactNode> = {
  "cart.json": <ShoppingCart className="h-4 w-4" />,
  "wishlist.json": <Heart className="h-4 w-4" />,
  "preferences.json": <Settings className="h-4 w-4" />,
  "orders.json": <ClipboardList className="h-4 w-4" />,
  "profile.json": <User className="h-4 w-4" />,
  "session.json": <Database className="h-4 w-4" />,
};

export const UserDataViewer = () => {
  const [userFolders, setUserFolders] = useState<UserFolder[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [fileContents, setFileContents] = useState<FileContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { logAction } = useAuditLog();

  const fetchUserFolders = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("admin-list-storage", {
        body: { bucket: "userdata" },
      });
      if (fnError) { setError(fnError.message || "Failed to fetch user data"); setUserFolders([]); return; }
      if (data?.error) { setError(data.error); setUserFolders([]); return; }
      setUserFolders(data?.folders || []);
      await logAction("view_customer_data", "customer", undefined, { user_count: data?.folders?.length || 0 });
    } catch (err) {
      setError("An unexpected error occurred");
    } finally { setLoading(false); }
  };

  const fetchUserFiles = async (userId: string) => {
    setLoadingFiles(true);
    setSelectedUser(userId);
    setFileContents([]);
    const user = userFolders.find(u => u.userId === userId);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("admin-list-storage", {
        body: { bucket: "userdata", userId },
      });
      if (fnError || data?.error) { setFileContents([]); return; }
      setFileContents(data?.files || []);
      await logAction("view_user_files", "user_storage", userId, {
        user_email: user?.email || "unknown",
        files_viewed: data?.files?.map((f: FileContent) => f.name) || [],
      });
    } catch (err) {
      console.error("Error fetching files:", err);
    } finally { setLoadingFiles(false); }
  };

  useEffect(() => { fetchUserFolders(); }, []);

  return (
    <div className="admin-glass-panel overflow-hidden">
      <div className="p-8 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="h-5 w-5 text-[hsl(45,76%,52%)]" />
          <h3 className="text-lg font-bold">User Data Storage</h3>
          <span className="text-[10px] font-bold text-white/40 bg-white/5 px-3 py-1 rounded-full uppercase tracking-widest">
            {userFolders.length} users
          </span>
        </div>
        <button onClick={fetchUserFolders} disabled={loading} className="px-4 py-2 rounded-lg border border-white/10 text-white/60 text-[10px] font-bold uppercase tracking-widest hover:border-[hsl(45,76%,52%,0.3)] hover:text-[hsl(45,76%,52%)] transition-all flex items-center gap-2 disabled:opacity-50">
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(45,76%,52%)]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 text-red-500/50" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        ) : userFolders.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="h-12 w-12 mx-auto mb-3 text-white/20" />
            <p className="text-white/40 text-sm">No user data files found</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* User List */}
            <div className="border border-white/5 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                <h4 className="font-medium text-sm text-white/60">Users with Data</h4>
              </div>
              <ScrollArea className="h-[400px]">
                <div className="p-2 space-y-1">
                  {userFolders.map((user) => (
                    <button
                      key={user.userId}
                      onClick={() => fetchUserFiles(user.userId)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedUser === user.userId
                          ? "bg-[hsl(45,76%,52%,0.1)] border border-[hsl(45,76%,52%,0.3)] text-[hsl(45,76%,52%)]"
                          : "hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{user.email || "No email"}</p>
                          <p className="text-xs opacity-50 truncate font-mono">{user.userId.slice(0, 8)}...</p>
                        </div>
                        <span className="text-[10px] font-bold text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{user.files.length}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* File Contents */}
            <div className="border border-white/5 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                <h4 className="font-medium text-sm text-white/60">{selectedUser ? "File Contents" : "Select a user"}</h4>
              </div>
              <ScrollArea className="h-[400px]">
                {loadingFiles ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[hsl(45,76%,52%)]"></div>
                  </div>
                ) : !selectedUser ? (
                  <div className="text-center py-12">
                    <FileJson className="h-10 w-10 mx-auto mb-2 text-white/20" />
                    <p className="text-sm text-white/40">Select a user to view data</p>
                  </div>
                ) : fileContents.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-10 w-10 mx-auto mb-2 text-white/20" />
                    <p className="text-sm text-white/40">No files found</p>
                  </div>
                ) : (
                  <Accordion type="multiple" className="p-2">
                    {fileContents.map((file) => (
                      <AccordionItem key={file.name} value={file.name} className="border-white/5">
                        <AccordionTrigger className="px-3 py-2 hover:no-underline text-white/80 hover:text-[hsl(45,76%,52%)]">
                          <div className="flex items-center gap-2">
                            {FILE_ICONS[file.name] || <FileJson className="h-4 w-4" />}
                            <span className="text-sm font-medium">{file.name}</span>
                            {file.error && <span className="admin-badge admin-badge-destructive">Error</span>}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-3">
                          {file.error ? (
                            <div className="text-red-400 text-sm p-2 bg-red-500/10 rounded">{file.error}</div>
                          ) : (
                            <pre className="text-xs bg-white/[0.03] p-3 rounded-lg overflow-x-auto max-h-[200px] text-white/60 border border-white/5">
                              {JSON.stringify(file.content, null, 2)}
                            </pre>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </ScrollArea>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
