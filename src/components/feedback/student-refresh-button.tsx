"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStudentRefresh } from "@/hooks/use-student-refresh";
import type { RefreshTarget } from "@/lib/student/refresh-policy";

/** A deliberate live refresh; automatic cache-first queries remain unchanged. */
export function StudentRefreshButton({ target }: { target: RefreshTarget }) {
  const { refresh, isRefreshing, enabled } = useStudentRefresh(target);
  if (!enabled) return null;
  return (
    <Button
      variant="ghost"
      size="icon-touch"
      aria-label={`Refresh ${target}`}
      title={`Refresh ${target} from your student account`}
      disabled={isRefreshing}
      aria-busy={isRefreshing}
      onClick={refresh}
    >
      <RefreshCw
        aria-hidden
        className={
          isRefreshing ? "animate-spin motion-reduce:animate-none" : undefined
        }
      />
    </Button>
  );
}
