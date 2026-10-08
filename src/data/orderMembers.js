// THE ORDER — core committee of DJS Trinity.
// `image` is a web-sized crop of the original transparent PNG in public/core_photos/
// (originals untouched; crops live in public/core_photos/web/).
// `source` records which original each crop came from.

export const chairperson = {
  name: "Prath Patel",
  designation: "Chairperson",
  image: "/core_photos/web/prath.webp",
  source: "/core_photos/Prath-Photoroom.png",
  blurb: "Leads the vision, unites the team and drives the committee towards a bigger tomorrow.",
};

export const orderTiers = [
  {
    id: "joint-chairpersons",
    title: "Joint Chairpersons",
    size: "md",
    offsets: [28, 0, 28], // vertical stagger (px) so the row reads as a constellation, not a grid
    members: [
      { name: "Nandish Vyas", designation: "Joint Chairperson", image: "/core_photos/web/nandish.webp", source: "/core_photos/Nandish-Photoroom.png" },
      { name: "Aadi", designation: "Joint Chairperson", image: "/core_photos/web/aadi.webp", source: "/core_photos/Aadi-Photoroom.png" },
      { name: "Aditya", designation: "Joint Chairperson", image: "/core_photos/web/aditya.webp", source: "/core_photos/Aditya-Photoroom.png" },
    ],
  },
  {
    id: "general-secretary",
    title: "General Secretary",
    size: "md",
    offsets: [0],
    members: [
      { name: "Dhruv", designation: "General Secretary", image: "/core_photos/web/dhruv.webp", source: "/core_photos/Dhruv-Photoroom.png" },
    ],
  },
  {
    id: "treasurers",
    title: "Treasurers",
    size: "sm",
    offsets: [0, 36],
    members: [
      { name: "Amaansh Kazani", designation: "Treasurer", image: "/core_photos/web/amaansh.webp", source: "/core_photos/Amaansh-Photoroom.png" },
      { name: "Bhargav Singh", designation: "Treasurer", image: "/core_photos/web/bhargav.webp", source: "/core_photos/Bhargav-Photoroom.png" },
    ],
  },
  {
    id: "admins",
    title: "Admins",
    size: "sm",
    offsets: [36, 0],
    members: [
      { name: "Vamshi Potabattini", designation: "Admin", image: "/core_photos/web/vamshi.webp", source: "/core_photos/vamshi-Photoroom.png" },
      { name: "Parth Gurav", designation: "Admin", image: "/core_photos/web/parth.webp", source: "/core_photos/Parth-Photoroom.png" },
    ],
  },
];
