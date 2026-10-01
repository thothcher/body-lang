/**
 * პოზების ცხრილი — ყველა ილუსტრაცია აქედან იხატება.
 * კოორდინატები viewBox "0 0 200 340"-ისთვის (წინხედი, მდგარი ფიგურა).
 */

export type Pt = [number, number];

export type HandStyle =
  | "relaxed"
  | "fist"
  | "palm-up"
  | "palm-down"
  | "palm-front"
  | "point"
  | "grip"
  | "pinch"
  | "flat"
  | "hidden";

export type JointHand =
  | "none"
  | "clasp"
  | "steeple-up"
  | "steeple-down"
  | "rub"
  | "hold-bag";

export type LegStyle =
  | "stand"
  | "stand-wide"
  | "stand-narrow"
  | "cross-stand"
  | "toe-point"
  | "weight-shift";

export interface Arm {
  elbow: Pt;
  wrist: Pt;
  hand: HandStyle;
  /** ხელის ბრუნვა გრადუსებში */
  rot?: number;
  /** ხელი სხეულის უკან იხატება */
  behind?: boolean;
}

export interface Pose {
  /** სათაური ილუსტრაციის ქვეშ (არასავალდებულო) */
  label?: string;
  crop?: "full" | "bust" | "wide";
  headOffset?: Pt;
  headTilt?: number;
  /** მზერის მიმართულება -1..1 */
  gaze?: Pt;
  brow?: "neutral" | "up" | "down" | "worried";
  mouth?: "neutral" | "smile" | "flat" | "frown" | "open" | "tight";
  eyes?: "open" | "closed" | "narrow" | "wide";
  shoulderLift?: number;
  lean?: number;
  armL: Arm;
  armR: Arm;
  joint?: JointHand;
  jointAt?: Pt;
  legs?: LegStyle;
  /** ხაზგასმული ზონა */
  focus?: { at: Pt; r: number }[];
  /** მოძრაობის ისრები */
  motion?: { from: Pt; to: Pt; curve?: number }[];
  props?: ("collar" | "bag" | "watch" | "pocket-line" | "partner-shake")[];
}

const REST_L: Arm = { elbow: [62, 148], wrist: [57, 198], hand: "relaxed" };
const REST_R: Arm = { elbow: [138, 148], wrist: [143, 198], hand: "relaxed" };

/** სახის ჟესტებისთვის — მეორე ხელი მუცელთან ისვენებს */
const SUPPORT_L: Arm = { elbow: [60, 150], wrist: [86, 186], hand: "relaxed" };

export const POSES: Record<string, Pose> = {
  /* ------------------------- ნეიტრალური ------------------------- */
  neutral: {
    armL: REST_L,
    armR: REST_R,
    legs: "stand",
  },

  /* --------------------------- ხელის გულები --------------------------- */
  "palm-up": {
    armL: { elbow: [62, 150], wrist: [78, 158], hand: "palm-up", rot: -14 },
    armR: { elbow: [138, 150], wrist: [122, 158], hand: "palm-up", rot: 14 },
    mouth: "smile",
    legs: "stand",
    focus: [{ at: [100, 152], r: 38 }],
  },
  "palm-down": {
    armL: { elbow: [62, 148], wrist: [78, 156], hand: "palm-down", rot: -8 },
    armR: { elbow: [138, 148], wrist: [122, 156], hand: "palm-down", rot: 8 },
    mouth: "flat",
    brow: "down",
    legs: "stand",
    focus: [{ at: [100, 158], r: 38 }],
  },
  pointing: {
    armL: REST_L,
    armR: { elbow: [140, 146], wrist: [150, 100], hand: "point", rot: -56 },
    brow: "down",
    mouth: "open",
    legs: "stand-narrow",
    focus: [{ at: [152, 96], r: 22 }],
  },
  "rub-palms": {
    armL: { elbow: [66, 154], wrist: [90, 140], hand: "hidden" },
    armR: { elbow: [134, 154], wrist: [110, 140], hand: "hidden" },
    joint: "rub",
    jointAt: [100, 140],
    mouth: "smile",
    eyes: "wide",
    legs: "stand",
    motion: [
      { from: [74, 124], to: [126, 124], curve: -7 },
      { from: [126, 158], to: [74, 158], curve: 7 },
    ],
    focus: [{ at: [100, 140], r: 30 }],
  },
  "rub-palms-slow": {
    armL: { elbow: [66, 154], wrist: [90, 140], hand: "hidden" },
    armR: { elbow: [134, 154], wrist: [110, 140], hand: "hidden" },
    joint: "rub",
    jointAt: [100, 140],
    mouth: "tight",
    eyes: "narrow",
    legs: "stand",
    motion: [{ from: [80, 124], to: [120, 124], curve: -5 }],
    focus: [{ at: [100, 140], r: 30 }],
  },

  /* ------------------------ ხელის ჩამორთმევა ------------------------ */
  "shake-equal": {
    crop: "wide",
    armL: SUPPORT_L,
    armR: { elbow: [152, 120], wrist: [166, 128], hand: "flat", rot: 96 },
    mouth: "smile",
    props: ["partner-shake"],
    focus: [{ at: [174, 128], r: 25 }],
  },
  "shake-dominant": {
    crop: "wide",
    armL: SUPPORT_L,
    armR: { elbow: [152, 116], wrist: [166, 124], hand: "palm-down", rot: 8 },
    brow: "down",
    mouth: "flat",
    props: ["partner-shake"],
    focus: [{ at: [174, 128], r: 25 }],
  },
  "shake-submissive": {
    crop: "wide",
    armL: SUPPORT_L,
    armR: { elbow: [152, 124], wrist: [166, 133], hand: "palm-up", rot: -8 },
    mouth: "flat",
    brow: "worried",
    props: ["partner-shake"],
    focus: [{ at: [174, 128], r: 25 }],
  },
  "shake-weak": {
    crop: "wide",
    armL: SUPPORT_L,
    armR: { elbow: [153, 124], wrist: [167, 131], hand: "relaxed", rot: 96 },
    mouth: "flat",
    shoulderLift: 3,
    props: ["partner-shake"],
    focus: [{ at: [174, 128], r: 25 }],
  },

  /* --------------------------- ხელები --------------------------- */
  "clench-high": {
    armL: { elbow: [70, 166], wrist: [92, 112], hand: "hidden" },
    armR: { elbow: [130, 166], wrist: [110, 112], hand: "hidden" },
    joint: "clasp",
    jointAt: [101, 110],
    brow: "down",
    mouth: "tight",
    legs: "stand",
    focus: [{ at: [101, 110], r: 28 }],
  },
  "clench-mid": {
    armL: { elbow: [70, 164], wrist: [92, 162], hand: "hidden" },
    armR: { elbow: [130, 164], wrist: [110, 162], hand: "hidden" },
    joint: "clasp",
    jointAt: [101, 160],
    mouth: "flat",
    legs: "stand",
    focus: [{ at: [101, 160], r: 26 }],
  },
  "clench-low": {
    armL: { elbow: [66, 160], wrist: [92, 206], hand: "hidden" },
    armR: { elbow: [134, 160], wrist: [110, 206], hand: "hidden" },
    joint: "clasp",
    jointAt: [101, 206],
    mouth: "flat",
    legs: "stand",
    focus: [{ at: [101, 206], r: 24 }],
  },
  "steeple-up": {
    armL: { elbow: [70, 172], wrist: [90, 140], hand: "hidden" },
    armR: { elbow: [130, 172], wrist: [112, 140], hand: "hidden" },
    joint: "steeple-up",
    jointAt: [101, 136],
    brow: "up",
    headTilt: -3,
    legs: "stand",
    focus: [{ at: [101, 124], r: 28 }],
  },
  "steeple-down": {
    armL: { elbow: [70, 168], wrist: [90, 166], hand: "hidden" },
    armR: { elbow: [130, 168], wrist: [112, 166], hand: "hidden" },
    joint: "steeple-down",
    jointAt: [101, 168],
    mouth: "flat",
    legs: "stand",
    focus: [{ at: [101, 174], r: 26 }],
  },
  "behind-back": {
    armL: { elbow: [58, 150], wrist: [90, 198], hand: "hidden", behind: true },
    armR: { elbow: [142, 150], wrist: [112, 198], hand: "hidden", behind: true },
    joint: "clasp",
    jointAt: [101, 200],
    headTilt: -2,
    headOffset: [0, -2],
    mouth: "flat",
    legs: "stand",
  },
  "behind-back-wrist": {
    armL: { elbow: [56, 148], wrist: [94, 196], hand: "hidden", behind: true },
    armR: { elbow: [144, 148], wrist: [108, 190], hand: "grip", behind: true },
    headOffset: [0, -2],
    brow: "down",
    mouth: "tight",
    legs: "stand",
    focus: [{ at: [104, 194], r: 22 }],
  },
  hips: {
    armL: { elbow: [48, 152], wrist: [80, 190], hand: "grip" },
    armR: { elbow: [152, 152], wrist: [120, 190], hand: "grip" },
    brow: "down",
    mouth: "flat",
    legs: "stand-wide",
    focus: [
      { at: [80, 190], r: 20 },
      { at: [120, 190], r: 20 },
    ],
  },
  "thumbs-pockets": {
    armL: { elbow: [54, 154], wrist: [80, 202], hand: "pinch", rot: -12 },
    armR: { elbow: [146, 154], wrist: [120, 202], hand: "pinch", rot: 12 },
    headOffset: [0, -3],
    brow: "up",
    mouth: "flat",
    legs: "stand-wide",
    props: ["pocket-line"],
    focus: [
      { at: [80, 198], r: 18 },
      { at: [120, 198], r: 18 },
    ],
  },
  "crossed-thumbs": {
    armL: { elbow: [58, 150], wrist: [124, 160], hand: "pinch", rot: 14 },
    armR: { elbow: [142, 150], wrist: [76, 146], hand: "pinch", rot: -14 },
    brow: "up",
    mouth: "flat",
    headOffset: [0, -3],
    legs: "stand",
    focus: [
      { at: [124, 150], r: 16 },
      { at: [76, 136], r: 16 },
    ],
  },

  /* --------------------------- სიცრუე --------------------------- */
  "mouth-guard": {
    crop: "bust",
    armL: SUPPORT_L,
    armR: { elbow: [142, 142], wrist: [110, 66], hand: "flat", rot: -70 },
    eyes: "narrow",
    gaze: [-0.4, 0.1],
    mouth: "flat",
    focus: [{ at: [104, 62], r: 24 }],
  },
  "fake-cough": {
    crop: "bust",
    armL: SUPPORT_L,
    armR: { elbow: [142, 142], wrist: [112, 64], hand: "fist", rot: -70 },
    eyes: "narrow",
    gaze: [-0.4, 0.1],
    mouth: "open",
    focus: [{ at: [106, 60], r: 24 }],
    motion: [{ from: [126, 48], to: [146, 34], curve: 6 }],
  },
  "nose-touch": {
    crop: "bust",
    armL: SUPPORT_L,
    armR: { elbow: [142, 140], wrist: [108, 56], hand: "point", rot: -66 },
    eyes: "narrow",
    gaze: [-0.5, 0],
    mouth: "flat",
    focus: [{ at: [102, 52], r: 22 }],
  },
  "eye-rub": {
    crop: "bust",
    armL: SUPPORT_L,
    armR: { elbow: [142, 136], wrist: [112, 44], hand: "point", rot: -62 },
    eyes: "closed",
    gaze: [0, 0.4],
    mouth: "flat",
    focus: [{ at: [110, 42], r: 22 }],
  },
  "ear-scratch": {
    crop: "bust",
    armL: SUPPORT_L,
    armR: { elbow: [146, 132], wrist: [128, 52], hand: "pinch", rot: -54 },
    eyes: "narrow",
    mouth: "tight",
    focus: [{ at: [126, 50], r: 20 }],
  },
  "neck-scratch": {
    crop: "bust",
    armL: SUPPORT_L,
    armR: { elbow: [146, 136], wrist: [120, 80], hand: "point", rot: -46 },
    eyes: "narrow",
    brow: "worried",
    mouth: "tight",
    focus: [{ at: [118, 78], r: 20 }],
    motion: [{ from: [126, 70], to: [126, 92], curve: 4 }],
  },
  "collar-pull": {
    crop: "bust",
    armL: SUPPORT_L,
    armR: { elbow: [146, 138], wrist: [116, 88], hand: "pinch", rot: -48 },
    brow: "worried",
    mouth: "open",
    props: ["collar"],
    focus: [{ at: [114, 88], r: 22 }],
    motion: [{ from: [118, 92], to: [136, 84], curve: -5 }],
  },
  "fingers-mouth": {
    crop: "bust",
    armL: SUPPORT_L,
    armR: { elbow: [142, 142], wrist: [106, 64], hand: "pinch", rot: -72 },
    eyes: "wide",
    brow: "worried",
    mouth: "neutral",
    focus: [{ at: [102, 62], r: 20 }],
  },

  /* ------------------- მოწყენილობა და შეფასება ------------------- */
  bored: {
    crop: "bust",
    headOffset: [-9, 5],
    headTilt: -12,
    armL: { elbow: [62, 178], wrist: [82, 78], hand: "flat", rot: 74 },
    armR: { elbow: [138, 158], wrist: [116, 186], hand: "relaxed" },
    eyes: "narrow",
    gaze: [-0.2, 0.4],
    mouth: "flat",
    focus: [{ at: [80, 78], r: 22 }],
  },
  evaluation: {
    crop: "bust",
    headOffset: [-3, 1],
    headTilt: -5,
    armL: { elbow: [62, 176], wrist: [82, 76], hand: "point", rot: 66 },
    armR: { elbow: [138, 158], wrist: [116, 186], hand: "relaxed" },
    eyes: "open",
    mouth: "neutral",
    focus: [{ at: [80, 62], r: 20 }],
  },
  critical: {
    crop: "bust",
    headOffset: [-2, 0],
    armL: { elbow: [62, 170], wrist: [82, 66], hand: "point", rot: 82 },
    armR: { elbow: [138, 158], wrist: [116, 186], hand: "relaxed" },
    eyes: "narrow",
    brow: "down",
    mouth: "frown",
    focus: [{ at: [80, 54], r: 20 }],
  },
  "chin-stroke": {
    crop: "bust",
    headTilt: 3,
    armL: SUPPORT_L,
    armR: { elbow: [140, 148], wrist: [110, 82], hand: "pinch", rot: -62 },
    eyes: "narrow",
    gaze: [0.3, 0.2],
    mouth: "neutral",
    focus: [{ at: [104, 80], r: 20 }],
  },
  interest: {
    crop: "bust",
    headTilt: -10,
    armL: { elbow: [64, 174], wrist: [88, 92], hand: "fist", rot: 60 },
    armR: { elbow: [138, 158], wrist: [116, 186], hand: "relaxed" },
    eyes: "wide",
    brow: "up",
    mouth: "smile",
    focus: [{ at: [90, 94], r: 20 }],
  },
  "neck-slap": {
    crop: "bust",
    headOffset: [0, 2],
    armL: SUPPORT_L,
    armR: { elbow: [150, 130], wrist: [120, 70], hand: "flat", rot: -40 },
    eyes: "narrow",
    gaze: [-0.5, 0.3],
    brow: "down",
    mouth: "frown",
    focus: [{ at: [120, 68], r: 22 }],
  },
  "forehead-slap": {
    crop: "bust",
    armL: SUPPORT_L,
    armR: { elbow: [144, 130], wrist: [104, 34], hand: "flat", rot: -78 },
    eyes: "closed",
    brow: "up",
    mouth: "open",
    focus: [{ at: [100, 32], r: 22 }],
  },

  /* ---------------------- მკლავების ბარიერები ---------------------- */
  "arms-crossed": {
    armL: { elbow: [58, 152], wrist: [126, 164], hand: "flat", rot: 10 },
    armR: { elbow: [142, 148], wrist: [74, 148], hand: "flat", rot: 190 },
    mouth: "flat",
    brow: "down",
    legs: "stand",
    focus: [{ at: [100, 156], r: 40 }],
  },
  "arms-crossed-fists": {
    armL: { elbow: [56, 152], wrist: [128, 166], hand: "fist", rot: 10 },
    armR: { elbow: [144, 148], wrist: [72, 148], hand: "fist", rot: 190 },
    mouth: "tight",
    brow: "down",
    eyes: "narrow",
    legs: "stand-wide",
    focus: [
      { at: [128, 166], r: 18 },
      { at: [72, 148], r: 18 },
    ],
  },
  "arms-gripping": {
    armL: { elbow: [56, 156], wrist: [130, 136], hand: "grip", rot: 20 },
    armR: { elbow: [144, 156], wrist: [70, 132], hand: "grip", rot: 200 },
    mouth: "tight",
    brow: "worried",
    shoulderLift: 4,
    legs: "stand-narrow",
    focus: [
      { at: [130, 136], r: 18 },
      { at: [70, 132], r: 18 },
    ],
  },
  "partial-barrier": {
    armL: { elbow: [64, 166], wrist: [132, 188], hand: "grip", rot: 16 },
    armR: REST_R,
    mouth: "flat",
    brow: "worried",
    legs: "stand-narrow",
    focus: [{ at: [134, 186], r: 22 }],
  },
  "self-hug": {
    armL: { elbow: [56, 150], wrist: [122, 120], hand: "grip", rot: 26 },
    armR: { elbow: [144, 150], wrist: [78, 118], hand: "grip", rot: 206 },
    mouth: "tight",
    brow: "worried",
    shoulderLift: 5,
    legs: "stand-narrow",
    focus: [{ at: [100, 132], r: 44 }],
  },
  "watch-barrier": {
    armL: { elbow: [66, 168], wrist: [138, 196], hand: "pinch", rot: 14 },
    armR: REST_R,
    mouth: "flat",
    props: ["watch"],
    legs: "stand-narrow",
    focus: [{ at: [140, 196], r: 20 }],
  },
  "bag-barrier": {
    armL: { elbow: [68, 164], wrist: [90, 200], hand: "hidden" },
    armR: { elbow: [132, 164], wrist: [112, 200], hand: "hidden" },
    joint: "hold-bag",
    jointAt: [101, 204],
    mouth: "flat",
    legs: "stand-narrow",
    props: ["bag"],
    focus: [{ at: [101, 212], r: 28 }],
  },

  /* ---------------------------- ფეხები ---------------------------- */
  "legs-crossed-stand": {
    armL: { elbow: [58, 152], wrist: [126, 164], hand: "flat", rot: 10 },
    armR: { elbow: [142, 148], wrist: [74, 148], hand: "flat", rot: 190 },
    mouth: "flat",
    legs: "cross-stand",
    focus: [{ at: [100, 300], r: 40 }],
  },
  "open-stance": {
    armL: { elbow: [62, 152], wrist: [72, 196], hand: "palm-front", rot: -10 },
    armR: { elbow: [138, 152], wrist: [128, 196], hand: "palm-front", rot: 10 },
    mouth: "smile",
    legs: "stand-wide",
    focus: [{ at: [100, 306], r: 46 }],
  },
  "foot-point": {
    armL: REST_L,
    armR: REST_R,
    headTilt: 6,
    legs: "toe-point",
    focus: [{ at: [136, 312], r: 26 }],
    motion: [{ from: [140, 326], to: [172, 326], curve: 0 }],
  },

  /* ----------------------------- თავი ----------------------------- */
  "head-neutral": {
    crop: "bust",
    armL: REST_L,
    armR: REST_R,
    mouth: "neutral",
    focus: [{ at: [100, 52], r: 34 }],
  },
  "head-tilt": {
    crop: "bust",
    headTilt: -16,
    headOffset: [-3, 1],
    armL: REST_L,
    armR: REST_R,
    mouth: "smile",
    brow: "up",
    eyes: "wide",
    focus: [{ at: [98, 52], r: 34 }],
  },
  "head-down": {
    crop: "bust",
    headOffset: [0, 8],
    headTilt: 4,
    armL: REST_L,
    armR: REST_R,
    gaze: [0, 0.6],
    brow: "down",
    mouth: "frown",
    focus: [{ at: [100, 58], r: 34 }],
  },
  "head-up": {
    crop: "bust",
    headOffset: [0, -6],
    headTilt: -4,
    armL: REST_L,
    armR: REST_R,
    gaze: [0, -0.45],
    brow: "up",
    mouth: "flat",
    eyes: "narrow",
    focus: [{ at: [100, 46], r: 34 }],
  },
  "hands-behind-head": {
    crop: "bust",
    armL: { elbow: [38, 94], wrist: [76, 58], hand: "hidden", behind: true },
    armR: { elbow: [162, 94], wrist: [124, 58], hand: "hidden", behind: true },
    mouth: "smile",
    brow: "up",
    eyes: "narrow",
    focus: [
      { at: [40, 94], r: 17 },
      { at: [160, 94], r: 17 },
    ],
  },
  shrug: {
    crop: "bust",
    shoulderLift: 11,
    headOffset: [0, 3],
    armL: { elbow: [56, 140], wrist: [70, 154], hand: "palm-front", rot: -22 },
    armR: { elbow: [144, 140], wrist: [130, 154], hand: "palm-front", rot: 22 },
    brow: "up",
    mouth: "flat",
    focus: [
      { at: [62, 96], r: 19 },
      { at: [138, 96], r: 19 },
    ],
  },
};

/* ------------------------------------------------------------------
   ჯდომის (გვერდხედი) პოზები — ფეხების თავში
------------------------------------------------------------------- */

export interface SeatedPose {
  /** წინა ფეხი: მენჯი → მუხლი → კოჭი → ტერფის წვერი */
  legA: [Pt, Pt, Pt, Pt];
  legB: [Pt, Pt, Pt, Pt];
  /** ხელი: მხარი → იდაყვი → მაჯა */
  armA?: [Pt, Pt, Pt];
  armB?: [Pt, Pt, Pt];
  lean?: number;
  headTilt?: number;
  mouth?: Pose["mouth"];
  brow?: Pose["brow"];
  focus?: { at: Pt; r: number }[];
  clamp?: Pt[];
}

export const SEATED_POSES: Record<string, SeatedPose> = {
  "legs-crossed-sit": {
    legA: [
      [86, 228],
      [142, 234],
      [138, 296],
      [160, 300],
    ],
    legB: [
      [86, 224],
      [136, 222],
      [152, 284],
      [174, 288],
    ],
    armA: [
      [94, 138],
      [82, 186],
      [110, 216],
    ],
    lean: 0,
    mouth: "flat",
    focus: [{ at: [140, 250], r: 34 }],
  },
  "figure-four": {
    legA: [
      [86, 228],
      [144, 236],
      [140, 296],
      [162, 300],
    ],
    legB: [
      [86, 220],
      [124, 196],
      [166, 222],
      [178, 210],
    ],
    armA: [
      [94, 138],
      [74, 184],
      [104, 200],
    ],
    lean: -4,
    headTilt: -3,
    brow: "up",
    focus: [{ at: [146, 214], r: 36 }],
  },
  "figure-four-clamp": {
    legA: [
      [86, 228],
      [144, 236],
      [140, 296],
      [162, 300],
    ],
    legB: [
      [86, 220],
      [124, 196],
      [166, 222],
      [178, 210],
    ],
    armA: [
      [94, 138],
      [78, 180],
      [126, 198],
    ],
    lean: -2,
    brow: "down",
    mouth: "tight",
    clamp: [[126, 198]],
    focus: [{ at: [126, 198], r: 24 }],
  },
  "ankle-lock": {
    legA: [
      [86, 228],
      [134, 240],
      [126, 298],
      [148, 302],
    ],
    legB: [
      [86, 224],
      [128, 238],
      [138, 298],
      [158, 304],
    ],
    armA: [
      [94, 138],
      [80, 186],
      [112, 214],
    ],
    lean: 2,
    brow: "worried",
    mouth: "tight",
    focus: [{ at: [132, 300], r: 26 }],
  },
  "sit-open": {
    legA: [
      [86, 228],
      [142, 240],
      [148, 300],
      [170, 304],
    ],
    legB: [
      [86, 222],
      [136, 248],
      [142, 302],
      [164, 306],
    ],
    armA: [
      [94, 138],
      [84, 188],
      [126, 206],
    ],
    lean: -3,
    mouth: "smile",
    focus: [{ at: [140, 268], r: 36 }],
  },
};

export function getPose(key: string): Pose {
  return POSES[key] ?? POSES.neutral;
}
