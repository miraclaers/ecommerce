import type { Product } from "@/lib/types";

/** Shared demo shipping policy shown on every product detail page. */
export const STORE_SHIPPING = {
  disclaimer:
    "Demo store — no real fulfillment. Tracking numbers and carrier handoffs are simulated for portfolio purposes.",
  origin: "MiniShop Demo Warehouse · Austin, TX (US)",
  methods: [
    {
      method: "Standard",
      eta: "3–5 business days",
      cost: "Free over $100 · otherwise $6.99",
    },
    {
      method: "Express",
      eta: "1–2 business days",
      cost: "$14.99 flat (demo rate)",
    },
    {
      method: "Pickup (demo)",
      eta: "Same day after 2pm local",
      cost: "Free · show order QR at counter",
    },
  ],
  returns:
    "30-day hassle-free returns on unused items in original packaging. Prepaid label provided for US demo addresses.",
  warranty:
    "1-year limited warranty against manufacturing defects. Accidental damage not covered in this demo policy.",
} as const;

const PRODUCTS: Product[] = [
  {
    id: "1",
    title: "Wireless Headphones",
    price: 129,
    description:
      "Over-ear wireless headphones with clear audio and active noise canceling.",
    longDescription:
      "Studio-tuned over-ear headphones built for long listening sessions. Hybrid active noise canceling quiets commute noise while a tuned 40 mm driver keeps vocals clear and bass controlled. Soft protein-leather cushions and a padded headband stay comfortable past the three-hour mark.\n\nPair once over Bluetooth 5.3, then switch devices from the multipoint menu. On-ear controls handle volume, calls, and ANC modes without reaching for your phone. The fold-flat hinge packs into the included hard case for travel.",
    highlights: [
      "Hybrid ANC with transparency mode",
      "Up to 32 hours playback (ANC on)",
      "Bluetooth 5.3 multipoint (2 devices)",
      "USB-C fast charge: 10 min → ~4 hours",
    ],
    specs: [
      { label: "Form factor", value: "Over-ear, closed-back" },
      { label: "Drivers", value: "40 mm dynamic, neodymium" },
      { label: "Frequency response", value: "20 Hz – 20 kHz" },
      { label: "Impedance", value: "32 Ω" },
      { label: "Sensitivity", value: "98 dB SPL @ 1 kHz" },
      { label: "ANC", value: "Hybrid ANC + transparency" },
      { label: "Microphone", value: "4-mic array with beamforming" },
      { label: "Connectivity", value: "Bluetooth 5.3, USB-C audio" },
      { label: "Codecs", value: "AAC, SBC" },
      { label: "Battery", value: "32 h (ANC on) · 45 h (ANC off)" },
      { label: "Charging", value: "USB-C · ~2 h full · 10 min quick charge" },
      { label: "Weight", value: "255 g" },
      { label: "Dimensions (folded)", value: "185 × 165 × 75 mm" },
      { label: "In the box", value: "Case, USB-C cable, 3.5 mm cable, docs" },
    ],
    shipping: {
      weightNote:
        "Ships in a compact retail box (~0.6 kg packed). Fits standard letter-locker lockers; no signature required under $200 demo orders.",
    },
    reviews: [
      {
        id: "r1-1",
        author: "Maya R.",
        rating: 5,
        date: "2026-03-12",
        title: "Commute quiet, all day battery",
        body: "ANC knocks out subway rumble better than my last pair. I get a full work week between charges with ANC on. Cushions don’t get sweaty after two-hour calls. Wish the case were a bit slimmer, but otherwise solid.",
      },
      {
        id: "r1-2",
        author: "Jon P.",
        rating: 4,
        date: "2026-02-28",
        title: "Clear mics, slight hiss in transparency",
        body: "Call quality surprised me — coworkers stopped asking me to repeat myself. Transparency mode is usable outdoors though there’s a faint hiss at max volume. Multipoint with laptop + phone just works.",
      },
      {
        id: "r1-3",
        author: "Elena V.",
        rating: 5,
        date: "2026-02-14",
        title: "Bass controlled, not muddy",
        body: "I expected boomier consumer tuning and got a cleaner midrange instead. Great for podcasts and indie. Fit is secure for walking; not ideal for running. Fast charge saved me before a flight.",
      },
      {
        id: "r1-4",
        author: "Chris T.",
        rating: 4,
        date: "2026-01-30",
        title: "Comfortable for long sessions",
        body: "Wore them through a full coding day. Clamp force is medium — fine for glasses. App-less controls are enough; I didn’t miss a companion app. Demo shipping arrived in the simulated 4-day window.",
      },
    ],
    image: "/products/headphones.jpg",
    category: "Audio",
    createdAt: "2026-02-05",
    popularity: 92,
    rating: 4.6,
    stock: 25,
    discountPercent: 15,
  },
  {
    id: "2",
    title: "Mechanical Keyboard",
    price: 149,
    description:
      "Tactile mechanical keyboard with durable switches and customizable RGB lighting.",
    longDescription:
      "A tenkeyless mechanical board for desks that need room for a mouse. Hot-swappable tactile switches give a crisp bump without the sharp click of clicky stems — good for shared offices and late-night sessions. South-facing RGB under double-shot PBT keycaps stays readable after months of use.\n\nConnect over USB-C, 2.4 GHz dongle, or Bluetooth. The gasket-mounted plate softens bottom-out, and the pre-lubed stabilizers keep big keys quiet. Removable feet offer two typing angles out of the box.",
    highlights: [
      "TKL layout (87-key) · gasket mount",
      "Hot-swap sockets · tactile switches pre-installed",
      "Tri-mode: USB-C / 2.4 GHz / Bluetooth 5.1",
      "South-facing RGB · double-shot PBT keycaps",
    ],
    specs: [
      { label: "Layout", value: "TKL 87-key (ANSI US)" },
      { label: "Switches", value: "Tactile brown-style · hot-swappable 3/5-pin" },
      { label: "Actuation force", value: "45 g ± 10 g" },
      { label: "Actuation point", value: "2.0 mm · total travel 4.0 mm" },
      { label: "Keycaps", value: "Double-shot PBT · Cherry profile" },
      { label: "Plate / mount", value: "PC plate · gasket mount" },
      { label: "Connectivity", value: "USB-C · 2.4 GHz · Bluetooth 5.1" },
      { label: "Polling rate", value: "1000 Hz (wired / 2.4 GHz)" },
      { label: "Battery", value: "4000 mAh · ~120 h RGB off / ~40 h RGB on" },
      { label: "Lighting", value: "Per-key RGB · south-facing LEDs" },
      { label: "Dimensions", value: "368 × 136 × 38 mm (feet folded)" },
      { label: "Weight", value: "980 g (without cable)" },
      { label: "Cable", value: "1.8 m USB-C coiled detachable" },
      { label: "OS support", value: "Windows · macOS · Linux (demo)" },
    ],
    shipping: {
      weightNote:
        "Ships in a rigid carton with foam insert (~1.4 kg packed). Signature recommended for demo express; avoid mailbox crush on doorstep drops.",
    },
    reviews: [
      {
        id: "r2-1",
        author: "Diego M.",
        rating: 5,
        date: "2026-03-08",
        title: "Quiet tactile, great for office",
        body: "Bump is clear without the clicky noise that got me side-eye before. Stabilizers feel pre-lubed — no rattle on spacebar. Tri-mode switching is snappy; I leave the dongle in the laptop.",
      },
      {
        id: "r2-2",
        author: "Priya S.",
        rating: 4,
        date: "2026-02-21",
        title: "Solid build, RGB a bit bright default",
        body: "Case feels dense and doesn’t flex. Default RGB is loud; turned brightness down in the onboard menu. Missing a wrist rest in the box, but the typing angle with feet is comfortable.",
      },
      {
        id: "r2-3",
        author: "Alex K.",
        rating: 4,
        date: "2026-02-09",
        title: "Hot-swap ready for tinkerers",
        body: "Swapped in linears in under ten minutes. Stock browns are fine for coding. Bluetooth latency is okay for typing, not for competitive games — use the dongle there. Battery lasts about a week with RGB low.",
      },
      {
        id: "r2-4",
        author: "Nina L.",
        rating: 5,
        date: "2026-01-25",
        title: "PBT keycaps feel premium",
        body: "Texture hasn’t shined after a month of heavy use. South-facing LEDs don’t wash out legends. Demo checkout and shipping copy were clear that nothing ships for real — still a nice product page experience.",
      },
    ],
    image: "/products/keyboard.jpg",
    category: "Peripherals",
    createdAt: "2026-02-18",
    popularity: 88,
    rating: 4.3,
    stock: 15,
    discountPercent: 20,
  },
  {
    id: "3",
    title: "Gaming Mouse Pad",
    price: 39,
    description:
      "Large gaming mouse pad with smooth tracking, stitched edges, and spill resistance.",
    longDescription:
      "A desk-spanning cloth pad that keeps keyboard and mouse on one consistent surface. The low-friction weave favors both optical and laser sensors, while a natural rubber base grips wood and laminate desks without residue.\n\nStitched edges resist fraying after daily mouse sweeps. A light spill-resistant coating beads water long enough to wipe — not a submarine, but coffee accidents are less dramatic. Rolls for travel and flattens within an hour of unboxing.",
    highlights: [
      "Extended size 900 × 400 × 3 mm",
      "Stitched anti-fray edges",
      "Non-slip natural rubber base",
      "Spill-resistant cloth topcoat",
    ],
    specs: [
      { label: "Dimensions", value: "900 × 400 × 3 mm (35.4 × 15.7 × 0.12 in)" },
      { label: "Surface", value: "Micro-textured polyester cloth" },
      { label: "Base", value: "Natural rubber · non-slip" },
      { label: "Edge finish", value: "Stitched · low-profile" },
      { label: "Glide", value: "Control / balanced (medium speed)" },
      { label: "Sensor compatibility", value: "Optical & laser · 100–25,000+ DPI" },
      { label: "Water resistance", value: "Splash / spill resistant coating" },
      { label: "Weight", value: "620 g" },
      { label: "Colorway", value: "Matte charcoal with subtle grid" },
      { label: "Care", value: "Hand wash cold · air dry flat" },
      { label: "Packaging", value: "Rolled in kraft tube with wrap band" },
    ],
    shipping: {
      weightNote:
        "Ships rolled in a kraft tube (~0.8 kg packed). Leave unrolled under books for 30–60 minutes if corners curl after transit.",
    },
    reviews: [
      {
        id: "r3-1",
        author: "Sam W.",
        rating: 5,
        date: "2026-03-15",
        title: "Finally covers the whole desk",
        body: "Keyboard and mouse live on one surface now — no more lip between pad and desk. Stitching is low and doesn’t catch the mouse. Rubber base doesn’t slide even with aggressive flicks.",
      },
      {
        id: "r3-2",
        author: "Olivia H.",
        rating: 5,
        date: "2026-02-26",
        title: "Spill save is real",
        body: "Knocked half a latte — wiped it before it soaked. Surface speed is medium; I didn’t need to retune DPI. Flattened overnight after arriving rolled. Great value for the size.",
      },
      {
        id: "r3-3",
        author: "Ben C.",
        rating: 4,
        date: "2026-02-11",
        title: "Consistent tracking",
        body: "No spin-outs at the edges with a lightweight mouse. Wish there were a XXL option, but 90 cm is enough for my 120 cm desk. Color is matte — no rainbow RGB nonsense.",
      },
      {
        id: "r3-4",
        author: "Rita G.",
        rating: 5,
        date: "2026-01-19",
        title: "Quiet, dense feel",
        body: "Thicker than my old pad without feeling spongy. Edges haven’t frayed after six weeks. Demo shipping note about the tube was accurate — pack it carefully if you gift it.",
      },
    ],
    image: "/products/mousepad.jpg",
    category: "Accessories",
    createdAt: "2026-01-26",
    popularity: 73,
    rating: 4.9,
    stock: 8,
    discountPercent: 35,
  },
];

export function listProducts(): Product[] {
  return PRODUCTS;
}

export function readProductById(id: string): Product | undefined {
  return PRODUCTS.find((product) => product.id === id);
}
