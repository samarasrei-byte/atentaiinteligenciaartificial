import { useAuth } from "@/contexts/AuthContext";
import { isQAUser } from "@/lib/qaMode";
import { FlaskConical } from "lucide-react";

const QaModeIndicator = () => {
  const { user } = useAuth();
  
  const showIndicator = isQAUser(user?.email);
  
  if (!showIndicator) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-white shadow-lg animate-pulse">
      <FlaskConical className="h-4 w-4" />
      <span className="text-xs font-bold uppercase tracking-wide">QA Mode</span>
    </div>
  );
};

export default QaModeIndicator;
