/**
 * Re-mounts on portal navigation, so each page plays one entrance (see
 * `.page-enter` in globals.css) while the shell around it stays mounted.
 * CSS only - nothing ships to the client.
 */
export default function ClubPortalTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="page-enter">{children}</div>;
}
