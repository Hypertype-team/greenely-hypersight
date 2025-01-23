import { BarChart3, MessageCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const Sidebar = () => {
  const location = useLocation();

  const links = [
    { 
      icon: BarChart3, 
      label: "Charts", 
      path: "/" 
    },
    { 
      icon: MessageCircle, 
      label: "Chat", 
      path: "/chat" 
    },
  ];

  return (
    <div className="w-64 border-r bg-background p-4 flex flex-col gap-2">
      {links.map(({ icon: Icon, label, path }) => (
        <Link
          key={path}
          to={path}
          className={cn(
            "p-3 flex items-center gap-3 rounded-lg transition-colors hover:bg-accent",
            location.pathname === path && "bg-accent"
          )}
        >
          <Icon className="w-5 h-5" />
          <span className="font-medium">{label}</span>
        </Link>
      ))}
    </div>
  );
};