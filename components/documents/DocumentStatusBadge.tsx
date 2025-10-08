import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentStatusBadgeProps {
  status: "pending" | "processing" | "completed" | "failed";
  className?: string;
}

export function DocumentStatusBadge({
  status,
  className,
}: DocumentStatusBadgeProps) {
  const config = {
    pending: {
      icon: Clock,
      label: "Pending",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    processing: {
      icon: Loader2,
      label: "Processing",
      className: "bg-blue-100 text-blue-800 border-blue-200",
      animate: true,
    },
    completed: {
      icon: CheckCircle,
      label: "Completed",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    failed: {
      icon: XCircle,
      label: "Failed",
      className: "bg-red-100 text-red-800 border-red-200",
    },
  };

  const { icon: Icon, label, className: statusClassName, animate } = config[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        statusClassName,
        className
      )}
    >
      <Icon className={cn("h-3 w-3", animate && "animate-spin")} />
      {label}
    </span>
  );
}
