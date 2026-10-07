/**
 * Re-mounts on club-auth navigation, so each screen plays one entrance
 * (see `.page-enter` in globals.css). CSS only - nothing ships to the client.
 */
export default function ClubAuthTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="page-enter">{children}</div>;
}
