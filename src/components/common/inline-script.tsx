/**
 * A script that runs synchronously while the HTML parses - before first
 * paint - and is inert on the client.
 *
 * React warns when rendering <script> on the client, and scripts inserted by
 * DOM updates never execute anyway; so the type is `text/javascript` only in
 * the server render and `text/plain` on the client, with
 * `suppressHydrationWarning` absorbing the difference (the pattern from
 * Next's "Preventing flash before hydration" guide).
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
