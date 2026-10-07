"use client";

import { BookOpen, LogIn, LogOut, Palette, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { ROUTES } from "@/constants/auth";
import { STUDENT_ROUTES } from "@/constants/routes";
import { PALETTE_OPTIONS } from "@/constants/theme";
import { useSession } from "@/context/session-context";
import { useTheme } from "@/context/theme-context";
import { useSignOut } from "@/hooks/use-auth-actions";
import { useNavigation } from "@/hooks/use-navigation";
import { useProfile } from "@/hooks/use-student-data";
import { courseAttendance, mergeTheoryPracticalCourses } from "@/lib/student/attendance";

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

/**
 * ⌘K / Ctrl+K (or "/") from anywhere: jump to a page, a subject's
 * attendance, switch theme, or sign out - without touching the mouse.
 */
export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { items, utility } = useNavigation();
  const { session } = useSession();
  const { setPalette } = useTheme();
  const signOut = useSignOut();
  const profile = useProfile();
  const isGuest = !session || session.kind === "guest";

  const subjects = useMemo(
    () =>
      mergeTheoryPracticalCourses(profile.data?.courses ?? [], profile.data?.attendanceSource)
        .map(courseAttendance)
        .filter((s) => !s.isPending),
    [profile.data],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.key === "k" && (event.metaKey || event.ctrlKey)) || (event.key === "/" && !isTyping(event.target))) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const run = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        aria-label="Search and jump"
        className="h-9 gap-2 rounded-xl border-outline-variant bg-surface-container px-3 text-on-surface-muted md:w-64 md:justify-start"
      >
        <Search aria-hidden />
        <span className="hidden md:inline">Search or jump to</span>
        <kbd className="ml-auto hidden rounded-md border border-outline-variant bg-surface-high px-1.5 text-[0.6875rem] font-bold md:inline">⌘K</kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} title="Search Campus Web" description="Jump to a page, a subject, or an action.">
        <CommandInput placeholder="Where to?" />
        <CommandList>
          <CommandEmpty>Nothing matches that.</CommandEmpty>
          <CommandGroup heading="Go to">
            {[...items, ...utility].map(({ href, label, icon: Icon }) => (
              <CommandItem key={href} value={`go ${label}`} onSelect={() => run(() => router.push(href))}>
                <Icon aria-hidden /> {label}
              </CommandItem>
            ))}
          </CommandGroup>
          {subjects.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Subjects">
                {subjects.map((stats) => (
                  <CommandItem key={stats.course.courseCode + stats.course.courseTitle} value={`subject ${stats.course.courseTitle} ${stats.course.courseCode}`} onSelect={() => run(() => router.push(STUDENT_ROUTES.attendance))}>
                    <BookOpen aria-hidden /> {stats.course.courseTitle}
                    <CommandShortcut>{stats.percent.toFixed(0)}%</CommandShortcut>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
          <CommandSeparator />
          <CommandGroup heading="Theme">
            {PALETTE_OPTIONS.filter((option) => option.id !== "custom").map((option) => (
              <CommandItem key={option.id} value={`theme ${option.label}`} onSelect={() => run(() => setPalette(option.id))}>
                <Palette aria-hidden /> {option.label} theme
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Account">
            {isGuest ? (
              <CommandItem value="sign in" onSelect={() => run(() => router.push(ROUTES.home))}>
                <LogIn aria-hidden /> Sign in
              </CommandItem>
            ) : (
              <CommandItem value="sign out log out" onSelect={() => run(() => void signOut())}>
                <LogOut aria-hidden /> Sign out
              </CommandItem>
            )}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
