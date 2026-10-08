/** Site identity: names, URLs and store links used across metadata and UI. */

export const SITE = {
  name: "The Campus Web",
  shortName: "Campus Web",
  tagline: "Discover clubs. Explore events. Take part.",
  description:
    "Discover clubs and events, manage your plans, and keep track of event check-ins and check-outs - in one place.",
  url: "https://campusweb.in",
  ogImage: "/logo_png.png",
} as const;

export const STORE_LINKS = {
  playStore:
    "https://play.google.com/store/apps/details?id=com.campusweb.campusapp",
  appStore:
    "https://apps.apple.com/in/app/campus-app-the-all-in-one/id6760725730",
} as const;

export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/thecampusweb/",
  whatsappCommunity: "https://chat.whatsapp.com/BeywTQOA1hlD1krovsr8sm",
} as const;
