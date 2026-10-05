import { InlineScript } from "@/components/common/inline-script";
import { prePaintScript, themeStylesheet } from "@/lib/theme/build-theme";

/**
 * Server-rendered into <head>: every preset palette as CSS variables, then
 * the script that applies the saved palette before the first paint.
 */
export function ThemeHead() {
  return (
    <>
      <style
        id="theme-palettes"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: themeStylesheet() }}
      />
      <InlineScript html={prePaintScript()} />
    </>
  );
}
