/**
 * Re-mounts on every student navigation, so each page plays its entrance
 * (see `.page-enter` in globals.css). CSS only - nothing ships to the client.
 */
export default function StudentTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
