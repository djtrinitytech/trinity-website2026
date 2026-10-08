// Contact the Team — five council contacts.
// x / y are plaque centres in the contact scene's 1000 × 480 coordinate space (see Contact.jsx).
// Array order is also the mobile stacking order.

export const contacts = [
  {
    id: "prath",
    name: "Prath Patel",
    designation: "Chairperson",
    phone: "+91 96073 91515",
    tel: "tel:+919607391515",
    x: 500,
    y: 250,
    primary: true,
  },
  {
    id: "dhruv",
    name: "Dhruv Panicker",
    designation: "General Secretary",
    phone: "+91 99872 05139",
    tel: "tel:+919987205139",
    x: 215,
    y: 79,
    from: "left",
  },
  {
    id: "aadi",
    name: "Aadi Somaiya",
    designation: "Joint Chairperson",
    phone: "+91 93213 20606",
    tel: "tel:+919321320606",
    x: 785,
    y: 79,
    from: "right",
  },
  {
    id: "nandish",
    name: "Nandish Vyas",
    designation: "Joint Chairperson",
    phone: "+91 70399 66655",
    tel: "tel:+917039966655", // brief listed tel:+917039966665 — matched to the displayed number; confirm
    x: 300,
    y: 418,
    from: "below",
  },
  {
    id: "aditya",
    name: "Aditya Desai",
    designation: "Joint Chairperson",
    phone: "+91 82915 88572",
    tel: "tel:+918291588572",
    x: 700,
    y: 418,
    from: "below",
  },
];
