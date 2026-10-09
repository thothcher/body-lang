/**
 * 3D ავატარის რიგი.
 *
 * ყველა კიდური აგებულია ლოკალური -Y მიმართულებით, ამიტომ:
 *  rotation.x > 0  → კიდური უკან მიდის (-Z)
 *  rotation.z > 0  → კიდური +X-ისკენ იხრება
 * მხარეების ნიშანი: A = მაყურებლის მარცხნივ (x < 0), B = მარჯვნივ (x > 0).
 */

import type { HandShape } from "./avatar/handModel";

export type Side = -1 | 1;
export type { HandShape };

export interface ArmPose {
  /** წინ (+) / უკან (−) */
  swing: number;
  /** ტანიდან გარეთ (+) / შიგნით (−) */
  spread: number;
  /** ტანის გასწვრივ შემობრუნება (+ = სხეულის წინ გადაჯვარედინება) */
  yaw: number;
  /** იდაყვის მოხრა, 0 … 2.4 */
  elbow: number;
  /** მხრის ღერძული ბრუნვა — განსაზღვრავს, რომელ სიბრტყეში იხრება იდაყვი */
  upTwist?: number;
  /** წინამხრის ბრუნვა */
  twist?: number;
  /** მაჯის მოხრა */
  wrist?: number;
  /** ხელის გული ზემოთაა მიმართული */
  palmUp?: boolean;
  /** მტევნის ფორმა: თითების მოხრა (ნაგულისხმევად „relaxed“) */
  hand?: HandShape;
}

export interface LegPose {
  thigh: { x: number; z: number; y?: number };
  shin: { x: number };
  foot?: { x: number; y?: number };
}

export interface AvatarPose {
  armA: ArmPose;
  armB: ArmPose;
  legA: LegPose;
  legB: LegPose;
  head: { x: number; y: number; z: number };
  neck: { x: number };
  spine: { x: number; y: number; z: number };
  chest: { x: number; z: number };
  /** მენჯის სიმაღლე (მოხრილი მუხლებისთვის) */
  hipY: number;
  hipRotZ: number;
  shoulderLift: number;
  /** გუგების გადახრა −1 … 1 */
  gaze: { x: number; y: number };
  /** ქუთუთოების დახურვა 0 … 1 */
  lids: number;
  brow: number;
  mouth: number;
}

/* ------------------------------------------------------------------
   ხელების პრესეტები
------------------------------------------------------------------- */

const REST: ArmPose = { swing: 0.04, spread: 0.11, yaw: 0, elbow: 0.16, hand: "relaxed" };

export interface ArmPreset {
  id: string;
  label: string;
  hint: string;
  a: ArmPose;
  b: ArmPose;
  /** სიგნალის ID ინტერპრეტაციისთვის */
  signal: string;
}

export const ARM_PRESETS: ArmPreset[] = [
  {
    id: "neutral",
    label: "ნეიტრალური",
    hint: "ხელები ბუნებრივად ჩამოშვებული",
    a: REST,
    b: REST,
    signal: "neutral",
  },
  {
    id: "open",
    label: "ღია ხელის გულები",
    hint: "გულწრფელობა და ღიაობა",
    a: { swing: 0.16, spread: 0.3, yaw: -0.09, upTwist: -0.07, elbow: 1.13, palmUp: true, hand: "open" },
    b: { swing: 0.16, spread: 0.3, yaw: -0.09, upTwist: -0.07, elbow: 1.13, palmUp: true, hand: "open" },
    signal: "palms-open",
  },
  {
    id: "crossed",
    label: "გადაჯვარედინებული",
    hint: "თავდაცვა, უთანხმოება",
    a: { swing: 1.16, spread: -0.4, yaw: 0.96, upTwist: -0.67, elbow: 1.49, hand: "cup" },
    b: { swing: -0.08, spread: 0.97, yaw: 1.7, upTwist: -0.2, elbow: 1.64, hand: "cup" },
    signal: "arms-crossed",
  },
  {
    id: "steeple",
    label: "კოშკი",
    hint: "თავდაჯერებულობა",
    a: { swing: 0.05, spread: 0.39, yaw: 0.28, upTwist: -0.47, elbow: 2.03, hand: "steeple" },
    b: { swing: 0.05, spread: 0.39, yaw: 0.28, upTwist: -0.47, elbow: 2.03, hand: "steeple" },
    signal: "steeple",
  },
  {
    id: "behind",
    label: "ზურგს უკან",
    hint: "უპირატესობა, უშიშრობა",
    a: { swing: -0.82, spread: 0.46, yaw: 0.98, upTwist: -0.43, elbow: 1.16, hand: "relaxed" },
    b: { swing: -0.82, spread: 0.46, yaw: 0.98, upTwist: -0.43, elbow: 1.16, hand: "relaxed" },
    signal: "behind-back",
  },
  {
    id: "hips",
    label: "დოინჯი",
    hint: "მზადყოფნა, აგრესია",
    a: { swing: -0.92, spread: 0.97, yaw: 0.71, upTwist: -0.21, elbow: 1.51, hand: "fist" },
    b: { swing: -0.92, spread: 0.97, yaw: 0.71, upTwist: -0.21, elbow: 1.51, hand: "fist" },
    signal: "hips",
  },
  {
    id: "behind-head",
    label: "თავზე ხელები",
    hint: "„ყოვლისმცოდნე“",
    a: { swing: 2.4, spread: 1.02, yaw: 0.95, upTwist: -0.19, elbow: 2.0, hand: "cup" },
    b: { swing: 2.4, spread: 1.02, yaw: 0.95, upTwist: -0.19, elbow: 2.0, hand: "cup" },
    signal: "hands-behind-head",
  },
  {
    id: "point",
    label: "თითით მითითება",
    hint: "ყველაზე გამაღიზიანებელი",
    a: REST,
    b: { swing: 0.89, spread: 0.25, yaw: -0.03, upTwist: -0.05, elbow: 1.05, hand: "point" },
    signal: "pointing",
  },
  {
    id: "face",
    label: "ხელი სახესთან",
    hint: "სიცრუე ან ეჭვი",
    a: { swing: 0.65, spread: -0.07, yaw: 0.81, upTwist: -0.54, elbow: 1.53, hand: "relaxed" },
    b: { swing: 0.8, spread: -0.18, yaw: 0.36, upTwist: -0.28, elbow: 2.41, hand: "touch" },
    signal: "face-touch",
  },
  {
    id: "self-hug",
    label: "თავის ჩაჭერა",
    hint: "აღელვება, დაუცველობა",
    a: { swing: 1.2, spread: -0.4, yaw: 0.43, upTwist: -1.29, elbow: 1.56, hand: "cup" },
    b: { swing: 1.2, spread: -0.4, yaw: 0.43, upTwist: -1.29, elbow: 1.56, hand: "cup" },
    signal: "self-hug",
  },
  {
    id: "handshake",
    label: "ხელის ჩამორთმევა",
    hint: "პირველი სამი წამი",
    a: REST,
    b: { swing: 0.6, spread: 0, yaw: 0.24, upTwist: -0.13, elbow: 0.63, hand: "grip" },
    signal: "handshake",
  },
];

/* ------------------------------------------------------------------
   ფეხების პრესეტები
------------------------------------------------------------------- */

export interface LegPreset {
  id: string;
  label: string;
  hint: string;
  a: LegPose;
  b: LegPose;
  hipY?: number;
  signal: string;
  /** იგივე ფეხები სკამზე ჯდომისას */
  seated: { label: string; hint: string; a: LegPose; b: LegPose; signal?: string };
}

/* ჯდომისას ბარძაყი თითქმის ჰორიზონტალურია, წვივი — ვერტიკალური */
const SIT = 1.45;

export const LEG_PRESETS: LegPreset[] = [
  {
    id: "neutral",
    label: "ნეიტრალური",
    hint: "მხრების სიგანეზე",
    a: { thigh: { x: 0, z: -0.03 }, shin: { x: 0.03 } },
    b: { thigh: { x: 0, z: 0.03 }, shin: { x: 0.03 } },
    signal: "legs-neutral",
    seated: {
      label: "ნეიტრალური",
      hint: "ორივე ტერფი იატაკზე",
      a: { thigh: { x: -SIT, z: -0.05 }, shin: { x: SIT } },
      b: { thigh: { x: -SIT, z: 0.05 }, shin: { x: SIT } },
    },
  },
  {
    id: "open",
    label: "ღია სტოიკა",
    hint: "თავდაჯერებულობა",
    a: { thigh: { x: 0, z: -0.14 }, shin: { x: 0.05 } },
    b: { thigh: { x: 0, z: 0.14 }, shin: { x: 0.05 } },
    signal: "open-stance",
    seated: {
      label: "მუხლები გაშლილი",
      hint: "ტერიტორიის დაკავება",
      a: { thigh: { x: -SIT, z: -0.3 }, shin: { x: SIT - 0.05 } },
      b: { thigh: { x: -SIT, z: 0.3 }, shin: { x: SIT - 0.05 } },
    },
  },
  {
    id: "closed",
    label: "ფეხები ერთად",
    hint: "დაძაბულობა, ოფიციალურობა",
    a: { thigh: { x: 0, z: 0.05 }, shin: { x: 0.02 } },
    b: { thigh: { x: 0, z: -0.05 }, shin: { x: 0.02 } },
    signal: "legs-closed",
    seated: {
      label: "მუხლები ერთად",
      hint: "ოფიციალურობა, სიფრთხილე",
      a: { thigh: { x: -SIT, z: 0.035 }, shin: { x: SIT + 0.08 } },
      b: { thigh: { x: -SIT, z: -0.035 }, shin: { x: SIT + 0.08 } },
    },
  },
  {
    id: "crossed",
    label: "გადაჯვარედინებული",
    hint: "დახურულობა უცხო გარემოში",
    a: { thigh: { x: -0.04, z: 0.2, y: 0.1 }, shin: { x: 0.16 } },
    b: { thigh: { x: 0.02, z: -0.08 }, shin: { x: 0.04 } },
    signal: "legs-crossed",
    seated: {
      label: "ფეხი ფეხზე",
      hint: "დახურულობა, თავდაცვა",
      a: { thigh: { x: -1.62, z: 0.36, y: 0.06 }, shin: { x: 1.22 }, foot: { x: 0.25 } },
      b: { thigh: { x: -SIT, z: 0.02 }, shin: { x: SIT } },
    },
  },
  {
    id: "shift",
    label: "წონა ერთ ფეხზე",
    hint: "მოდუნება ან მოუთმენლობა",
    a: { thigh: { x: 0.02, z: -0.04 }, shin: { x: 0.02 } },
    b: { thigh: { x: -0.16, z: 0.16 }, shin: { x: 0.26 } },
    signal: "weight-shift",
    seated: {
      label: "ტერფები ჩაკეტილი",
      hint: "ემოციის შეკავება",
      a: { thigh: { x: -SIT, z: 0.02 }, shin: { x: 1.95 } },
      b: { thigh: { x: -SIT, z: -0.02 }, shin: { x: 1.95 } },
      signal: "ankle-lock",
    },
  },
  {
    id: "forward",
    label: "ერთი ფეხი წინ",
    hint: "ინტერესი იმ მიმართულებით",
    a: { thigh: { x: -0.3, z: -0.05 }, shin: { x: 0.18 } },
    b: { thigh: { x: 0.12, z: 0.05 }, shin: { x: 0.05 } },
    signal: "foot-forward",
    seated: {
      label: "ერთი ფეხი წინ",
      hint: "მზადაა წასასვლელად ან ჩასართავად",
      a: { thigh: { x: -SIT, z: -0.06 }, shin: { x: 1.0 } },
      b: { thigh: { x: -SIT, z: 0.06 }, shin: { x: 1.75 } },
    },
  },
];

/* ------------------------------------------------------------------
   თავი, მზერა, პოზა
------------------------------------------------------------------- */

export interface HeadPreset {
  id: string;
  label: string;
  hint: string;
  head: { x: number; y: number; z: number };
  neck?: number;
  brow?: number;
  mouth?: number;
  signal: string;
}

export const HEAD_PRESETS: HeadPreset[] = [
  { id: "neutral", label: "პირდაპირ", hint: "ნეიტრალური მოსმენა", head: { x: 0, y: 0, z: 0 }, signal: "head-neutral" },
  { id: "tilt", label: "გვერდზე გადახრილი", hint: "ინტერესი", head: { x: -0.05, y: 0.12, z: 0.26 }, brow: 0.5, mouth: 0.6, signal: "head-tilt" },
  { id: "down", label: "ქვემოთ დახრილი", hint: "კრიტიკა, განსჯა", head: { x: 0.3, y: 0, z: 0 }, neck: 0.12, brow: -0.6, mouth: -0.5, signal: "head-down" },
  { id: "up", label: "ნიკაპი წინ", hint: "ქედმაღლობა, უშიშრობა", head: { x: -0.26, y: 0, z: 0 }, neck: -0.08, brow: 0.2, signal: "head-up" },
  { id: "away", label: "გვერდზე მობრუნებული", hint: "დისტანცირება", head: { x: 0.04, y: 0.55, z: 0.04 }, signal: "head-away" },
];

export interface GazePreset {
  id: string;
  label: string;
  hint: string;
  gaze: { x: number; y: number };
  lids?: number;
  signal: string;
}

export const GAZE_PRESETS: GazePreset[] = [
  { id: "direct", label: "პირდაპირი", hint: "კონტაქტი", gaze: { x: 0, y: 0 }, signal: "gaze-direct" },
  { id: "business", label: "შუბლზე (საქმიანი)", hint: "კონტროლი", gaze: { x: 0, y: 0.5 }, signal: "gaze-business" },
  { id: "social", label: "პირისკენ (სოციალური)", hint: "მეგობრობა", gaze: { x: 0, y: -0.35 }, signal: "gaze-social" },
  { id: "left", label: "მარცხნივ", hint: "ყურადღება გვერდზე", gaze: { x: -0.8, y: 0 }, signal: "gaze-side" },
  { id: "right", label: "მარჯვნივ", hint: "ყურადღება გვერდზე", gaze: { x: 0.8, y: 0 }, signal: "gaze-side" },
  { id: "down", label: "ქვემოთ", hint: "არიდება, უხერხულობა", gaze: { x: -0.3, y: -0.8 }, lids: 0.35, signal: "gaze-avoid" },
  { id: "lowered", label: "დაწეული წამწამები", hint: "მოწყენილობა, ქედმაღლობა", gaze: { x: 0, y: -0.2 }, lids: 0.72, signal: "lids-lowered" },
];

export interface PosturePreset {
  id: string;
  label: string;
  hint: string;
  spine: { x: number; y: number; z: number };
  chest: { x: number; z: number };
  hipY: number;
  hipRotZ: number;
  shoulderLift: number;
  signal: string;
}

export const POSTURE_PRESETS: PosturePreset[] = [
  {
    id: "neutral",
    label: "ნეიტრალური",
    hint: "სწორი, მოდუნებული",
    spine: { x: 0, y: 0, z: 0 },
    chest: { x: 0, z: 0 },
    hipY: 0,
    hipRotZ: 0,
    shoulderLift: 0,
    signal: "posture-neutral",
  },
  {
    id: "confident",
    label: "თავდაჯერებული",
    hint: "მკერდი გახსნილი, მხრები უკან",
    spine: { x: -0.06, y: 0, z: 0 },
    chest: { x: -0.08, z: 0 },
    hipY: 0.012,
    hipRotZ: 0,
    shoulderLift: -0.018,
    signal: "posture-confident",
  },
  {
    id: "slouched",
    label: "მოხრილი",
    hint: "დაბალი ენერგია, დაუცველობა",
    spine: { x: 0.14, y: 0, z: 0 },
    chest: { x: 0.1, z: 0 },
    hipY: -0.02,
    hipRotZ: 0,
    shoulderLift: 0.03,
    signal: "posture-slouched",
  },
  {
    id: "lean-in",
    label: "წინ გადახრილი",
    hint: "ინტერესი, ჩართულობა",
    spine: { x: -0.2, y: 0, z: 0 },
    chest: { x: -0.05, z: 0 },
    hipY: -0.006,
    hipRotZ: 0,
    shoulderLift: 0,
    signal: "lean-in",
  },
  {
    id: "lean-back",
    label: "უკან გადახრილი",
    hint: "დისტანცია, შეფასება",
    spine: { x: 0.18, y: 0, z: 0 },
    chest: { x: -0.06, z: 0 },
    hipY: 0,
    hipRotZ: 0,
    shoulderLift: -0.01,
    signal: "lean-back",
  },
  {
    id: "turn-away",
    label: "გვერდზე მიბრუნებული",
    hint: "ნაწილობრივი დახურვა",
    spine: { x: 0.02, y: 0.42, z: 0 },
    chest: { x: 0, z: 0 },
    hipY: 0,
    hipRotZ: 0,
    shoulderLift: 0.008,
    signal: "turn-away",
  },
];

/* ------------------------------------------------------------------
   ტანსაცმელი
------------------------------------------------------------------- */

export interface Outfit {
  id: string;
  label: string;
  top: string;
  bottom: string;
  shoes: string;
  /** ოფიციალური ტანსაცმელი — პიჯაკი და საყელო */
  formal: boolean;
  signal: string;
}

export const OUTFITS: Outfit[] = [
  { id: "casual", label: "ყოველდღიური", top: "#5b7b9a", bottom: "#3b4252", shoes: "#2a2d34", formal: false, signal: "outfit-casual" },
  { id: "suit", label: "კოსტიუმი", top: "#2b3049", bottom: "#242838", shoes: "#1a1c22", formal: true, signal: "outfit-formal" },
  { id: "warm", label: "თბილი ტონები", top: "#b4634f", bottom: "#4a4038", shoes: "#332c26", formal: false, signal: "outfit-casual" },
  { id: "light", label: "ღია", top: "#e3dbcc", bottom: "#8a8577", shoes: "#5f5a50", formal: false, signal: "outfit-casual" },
  { id: "green", label: "მწვანე", top: "#5f8672", bottom: "#33403a", shoes: "#232b27", formal: false, signal: "outfit-casual" },
];

/* ------------------------------------------------------------------
   გარემო — ავეჯი, რომელიც კონტექსტს ცვლის
------------------------------------------------------------------- */

export interface Setting {
  id: string;
  label: string;
  hint: string;
  /** ადამიანი ზის */
  seated: boolean;
  signal?: string;
}

export const SETTINGS: Setting[] = [
  { id: "none", label: "ცარიელი სტუდია", hint: "მხოლოდ სხეული", seated: false },
  { id: "chair", label: "სკამი", hint: "ჯდომის პოზები: ფეხი ფეხზე, ტერფების ჩაკეტვა", seated: true, signal: "seated" },
  { id: "desk", label: "საწერი მაგიდა", hint: "მაგიდა — ბარიერი და ტერიტორია", seated: true, signal: "desk-barrier" },
  { id: "podium", label: "ტრიბუნა", hint: "საჯარო გამოსვლა ბარიერის უკან", seated: false, signal: "podium" },
];

export const SKINS = ["#e8c4a0", "#d8a87c", "#b98153", "#8d5a34", "#5f3a22", "#f0d5bb"];

/* ------------------------------------------------------------------
   საწყისი კონფიგურაცია
------------------------------------------------------------------- */

export interface AvatarConfig {
  arms: string;
  legs: string;
  head: string;
  gaze: string;
  posture: string;
  outfit: string;
  skin: string;
  setting: string;
}

export const DEFAULT_CONFIG: AvatarConfig = {
  arms: "neutral",
  legs: "neutral",
  head: "neutral",
  gaze: "direct",
  posture: "neutral",
  outfit: "casual",
  skin: SKINS[0],
  setting: "none",
};

export const isSeated = (cfg: Pick<AvatarConfig, "setting">) =>
  SETTINGS.find((x) => x.id === cfg.setting)?.seated ?? false;

/** მენჯის დაწევა ჯდომისას — ტერფები ზუსტად იატაკზე დგება */
export const SEAT_DROP = -0.37;

export function buildPose(cfg: AvatarConfig): AvatarPose {
  const arm = ARM_PRESETS.find((p) => p.id === cfg.arms) ?? ARM_PRESETS[0];
  const leg = LEG_PRESETS.find((p) => p.id === cfg.legs) ?? LEG_PRESETS[0];
  const head = HEAD_PRESETS.find((p) => p.id === cfg.head) ?? HEAD_PRESETS[0];
  const gaze = GAZE_PRESETS.find((p) => p.id === cfg.gaze) ?? GAZE_PRESETS[0];
  const post = POSTURE_PRESETS.find((p) => p.id === cfg.posture) ?? POSTURE_PRESETS[0];
  const seated = isSeated(cfg);
  const legs = seated ? leg.seated : leg;

  return {
    armA: arm.a,
    armB: arm.b,
    legA: legs.a,
    legB: legs.b,
    head: head.head,
    neck: { x: head.neck ?? 0 },
    spine: post.spine,
    chest: post.chest,
    hipY: seated ? SEAT_DROP : post.hipY + (leg.hipY ?? 0),
    hipRotZ: post.hipRotZ,
    shoulderLift: post.shoulderLift,
    gaze: gaze.gaze,
    lids: gaze.lids ?? 0,
    brow: head.brow ?? 0,
    mouth: head.mouth ?? 0,
  };
}

export function signalsOf(cfg: AvatarConfig): string[] {
  const leg = LEG_PRESETS.find((p) => p.id === cfg.legs);
  return [
    ARM_PRESETS.find((p) => p.id === cfg.arms)?.signal,
    isSeated(cfg) ? (leg?.seated.signal ?? leg?.signal) : leg?.signal,
    HEAD_PRESETS.find((p) => p.id === cfg.head)?.signal,
    GAZE_PRESETS.find((p) => p.id === cfg.gaze)?.signal,
    POSTURE_PRESETS.find((p) => p.id === cfg.posture)?.signal,
    OUTFITS.find((o) => o.id === cfg.outfit)?.signal,
    SETTINGS.find((x) => x.id === cfg.setting)?.signal,
  ].filter(Boolean) as string[];
}
