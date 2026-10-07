/** The people behind Campus Web (photos in public/assets/team). */
export interface TeamMember {
  name: string;
  caption: string;
}

export const TEAM: readonly TeamMember[] = [
  { name: "Aditya Coomar", caption: "I love CSS until I open it on Internet Explorer." },
  { name: "Ashutosh Anand", caption: "Just a caffeine-fueled code artisan, transforming brews into bytes." },
  { name: "Kshitij Mishra", caption: "Love to create things which can solve a problem." },
  { name: "Shreyansh Gupta", caption: "Love to create... problems." },
  { name: "Tanishq Pokharia", caption: "Shayar OP." },
  { name: "Vaibhav Raj", caption: "Following my passion to create stuff... literally." },
];

export const teamPhoto = (name: string) => `/assets/team/${encodeURIComponent(name)}.jpg`;
