"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Maximize2,
  Minimize2,
  Pin,
  PinOff,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { FileChip, KIND_ICON, chipLabel } from "@/components/notes/file-chip";
import { groupOf } from "@/components/notes/resource-sheet";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  RESOURCE_KINDS,
  RESOURCE_KIND_LABEL,
  type StudiqueResource,
  type StudiqueSubject,
} from "@/lib/student/notes";
import { driveDownloadUrl, driveEmbedUrl } from "@/lib/student/notes-store";

/**
 * The reading workspace: Drive's embedded preview beside a rail of every
 * file the subject has, so moving between units never means closing
 * anything. Previous / next (and the arrow keys) walk the whole subject in
 * reading order; fullscreen for long sessions; Drive and a download when the
 * embed won't do. On phones the rail becomes a strip of chips.
 */
export function ResourceViewer({
  subject,
  resource,
  opened,
  pinned,
  onTogglePin,
  onNavigate,
  onOpenChange,
}: {
  subject: StudiqueSubject | null;
  resource: StudiqueResource | null;
  /** Urls opened before, for the ticks. */
  opened: ReadonlySet<string>;
  pinned: boolean;
  onTogglePin: (subject: string) => void;
  onNavigate: (resource: StudiqueResource) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const stage = useRef<HTMLDivElement>(null);
  // Which file's embed has finished loading; a new file starts unloaded.
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const loaded = resource !== null && loadedUrl === resource.url;

  const groups = subject
    ? RESOURCE_KINDS.map((kind) => ({
        kind,
        items: groupOf(subject, kind),
      })).filter((g) => g.items.length > 0)
    : [];
  const order = groups.flatMap((g) => g.items);
  const at = resource ? order.findIndex((r) => r.url === resource.url) : -1;
  const previous = at > 0 ? order[at - 1] : null;
  const next = at >= 0 && at < order.length - 1 ? order[at + 1] : null;
  const download = resource ? driveDownloadUrl(resource.url) : null;
  const readCount = order.filter((r) => opened.has(r.url)).length;

  function toggleFullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void stage.current?.requestFullscreen?.();
  }

  useEffect(() => {
    if (!resource) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" && previous) onNavigate(previous);
      if (event.key === "ArrowRight" && next) onNavigate(next);
      if (event.key === "f" && !event.metaKey && !event.ctrlKey)
        toggleFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [resource, previous, next, onNavigate]);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement !== null);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  return (
    <Sheet open={resource !== null} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className="notes-reader flex flex-col gap-0 border-outline-variant bg-surface-modal p-0 data-[side=bottom]:h-[94dvh] data-[side=bottom]:rounded-t-3xl data-[side=right]:sm:max-w-[min(97vw,1280px)]"
      >
        <SheetHeader className="notes-reader-head">
          <div className="min-w-0 flex-1">
            <SheetTitle className="truncate pr-8 text-base font-extrabold text-on-surface sm:text-lg">
              {resource?.title}
            </SheetTitle>
            <SheetDescription className="truncate text-xs text-on-surface-muted">
              {subject?.name}
              {resource && ` · ${RESOURCE_KIND_LABEL[resource.kind]}`}
              {order.length > 1 && at >= 0 && ` · ${at + 1} of ${order.length}`}
              {readCount > 0 && ` · ${readCount} opened`}
            </SheetDescription>
          </div>
          {subject && (
            <button
              type="button"
              className="notes-pin notes-reader-pin"
              aria-pressed={pinned}
              aria-label={
                pinned
                  ? `Unpin ${subject.name}`
                  : `Pin ${subject.name} to the top`
              }
              onClick={() => onTogglePin(subject.name)}
            >
              {pinned ? (
                <PinOff aria-hidden className="size-4" />
              ) : (
                <Pin aria-hidden className="size-4" />
              )}
            </button>
          )}
        </SheetHeader>

        <div className="notes-reader-body">
          {subject && (
            <nav
              className="notes-reader-rail"
              aria-label="Files in this subject"
            >
              {groups.map(({ kind, items }) => {
                const Icon = KIND_ICON[kind];
                return (
                  <section key={kind} className="notes-rail-group">
                    <h3>
                      <Icon aria-hidden className="size-3.5" />
                      {RESOURCE_KIND_LABEL[kind]}
                      <span>{items.length}</span>
                    </h3>
                    <ul>
                      {items.map((item) => (
                        <li key={item.url}>
                          <button
                            type="button"
                            className="notes-rail-item"
                            aria-current={
                              item.url === resource?.url || undefined
                            }
                            data-opened={opened.has(item.url) || undefined}
                            onClick={() => onNavigate(item)}
                          >
                            <span className="notes-rail-badge" aria-hidden>
                              {chipLabel(item)}
                            </span>
                            <span className="truncate">{item.title}</span>
                            {opened.has(item.url) && (
                              <Check
                                aria-hidden
                                className="notes-rail-tick size-3.5"
                              />
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
              <p className="notes-rail-foot" aria-label="Keyboard shortcuts">
                <kbd>←</kbd>
                <kbd>→</kbd> files
                <kbd>F</kbd> fullscreen
                <kbd>Esc</kbd> close
              </p>
            </nav>
          )}

          <div className="notes-reader-stage" ref={stage}>
            {subject && order.length > 1 && (
              <div
                className="notes-reader-strip"
                aria-label="Files in this subject"
              >
                {order.map((item) => (
                  <FileChip
                    key={item.url}
                    resource={item}
                    opened={opened.has(item.url)}
                    active={item.url === resource?.url}
                    onClick={() => onNavigate(item)}
                  />
                ))}
              </div>
            )}
            <div className="notes-reader-frame">
              {!loaded && <div className="notes-reader-loading" aria-hidden />}
              {resource && (
                <iframe
                  key={resource.url}
                  src={driveEmbedUrl(resource.url)}
                  title={resource.title}
                  allow="autoplay; fullscreen"
                  onLoad={() => setLoadedUrl(resource.url)}
                  data-loaded={loaded || undefined}
                />
              )}
            </div>
            <div className="notes-reader-bar">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
                  title="F"
                >
                  {fullscreen ? (
                    <Minimize2 aria-hidden />
                  ) : (
                    <Maximize2 aria-hidden />
                  )}
                  <span className="hidden sm:inline">
                    {fullscreen ? "Exit" : "Fullscreen"}
                  </span>
                </Button>
                {download && (
                  <Button
                    variant="ghost"
                    size="sm"
                    render={
                      <a
                        href={download}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                    nativeButton={false}
                  >
                    <Download aria-hidden />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                )}
                {resource && (
                  <Button
                    variant="ghost"
                    size="sm"
                    render={
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                    nativeButton={false}
                  >
                    <ExternalLink aria-hidden />
                    <span className="hidden sm:inline">Drive</span>
                  </Button>
                )}
              </div>
              <div className="flex min-w-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!previous}
                  onClick={() => previous && onNavigate(previous)}
                  aria-label={
                    previous
                      ? `Previous: ${previous.title}`
                      : "No previous file"
                  }
                  title="←"
                >
                  <ChevronLeft aria-hidden />
                  <span className="hidden max-w-36 truncate sm:inline">
                    {previous?.title ?? "Previous"}
                  </span>
                </Button>
                <Button
                  size="sm"
                  disabled={!next}
                  onClick={() => next && onNavigate(next)}
                  aria-label={next ? `Next: ${next.title}` : "No next file"}
                  title="→"
                  className="notes-reader-next"
                >
                  <span className="max-w-40 truncate">
                    {next ? `Next: ${next.title}` : "Last file"}
                  </span>
                  <ChevronRight aria-hidden />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
