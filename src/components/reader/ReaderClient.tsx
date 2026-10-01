"use client";

import * as React from "react";
import Link from "next/link";
import GestureCard from "@/components/ui/GestureCard";
import { GESTURE_MAP } from "@/lib/content/gestures";
import { ArrowRight } from "lucide-react";

/* ------------------------------------------------------------------
   ზონები — წაკითხვის თანმიმდევრობით
------------------------------------------------------------------- */

interface Zone {
  id: string;
  order: number;
  label: string;
  at: [number, number];
  /** ნომრის ადგილი — ხელით, რომ არ გადაიფაროს */
  pin: [number, number];
  r: number;
  headline: string;
  look: string[];
  gestures: string[];
  chapter: string;
}

const ZONES: Zone[] = [
  {
    id: "distance",
    order: 1,
    label: "დისტანცია",
    at: [100, 322],
    pin: [42, 318],
    r: 30,
    headline: "რამდენად ახლოს დადგა?",
    look: [
      "15–46 სმ — ინტიმური ზონა. უცხოსთვის ეს შეჭრაა და სხეული ფიზიოლოგიურად რეაგირებს.",
      "46 სმ – 1.2 მ — პირადი ზონა: კოლეგები, ნაცნობები, წვეულება.",
      "1.2–3.6 მ — სოციალური ზონა: უცნობი, მომსახურე პერსონალი.",
      "გაითვალისწინე კულტურა: იაპონელისთვის კომფორტული დისტანცია ~25 სმ-ია, ამერიკელისთვის ~46.",
    ],
    gestures: [],
    chapter: "sivrce",
  },
  {
    id: "posture",
    order: 2,
    label: "პოზა და ტანი",
    at: [100, 150],
    pin: [152, 138],
    r: 44,
    headline: "სხეული ღიაა თუ დახურული?",
    look: [
      "ტანი შენსკენაა მიმართული თუ გვერდზე? სრული მობრუნება = მიწვევა, ნაწილობრივი = დისტანცია.",
      "მკერდი გახსნილია (თავდაჯერებულობა) თუ მხრები წინ არის გამოწეული (დაცვა)?",
      "წინ გადახრა = ჩართულობა. უკან გადახრა = შეფასება ან უარყოფითი გადაწყვეტილება.",
      "არის თუ არა ბარიერი — ხელი, ჩანთა, ჭიქა, საქაღალდე სხეულის წინ?",
    ],
    gestures: ["arms-crossed", "partial-barrier"],
    chapter: "xelebis-barieri",
  },
  {
    id: "legs",
    order: 3,
    label: "ფეხები",
    at: [100, 268],
    pin: [46, 266],
    r: 40,
    headline: "სად მიუთითებს ფეხი?",
    look: [
      "ფეხები ყველაზე გულწრფელია — მათზე ყველაზე ნაკლებად ვფიქრობთ.",
      "წინ გაწეული ფეხი მიუთითებს იმ ადამიანისკენ, ვინც ყველაზე საინტერესოა.",
      "ორივე ფეხი კარისკენ + ტანი შენსკენ = სურს წასვლა, მაგრამ თავაზიანობა უშლის.",
      "გადაჯვარედინებული ფეხები დგომისას = არასტაბილური, დახურული პოზა.",
    ],
    gestures: ["foot-point", "legs-crossed-stand", "open-stance"],
    chapter: "fexebi",
  },
  {
    id: "hands",
    order: 4,
    label: "ხელები",
    at: [58, 196],
    pin: [30, 192],
    r: 30,
    headline: "ხელის გულები ჩანს?",
    look: [
      "გაშლილი ხელის გულები = „ვერაფერს ვმალავ“. დამალული ხელები = შენიღბვა ან დაძაბულობა.",
      "ჩაჭდობილი ხელები ღიმილთან ერთადაც იმედგაცრუებას ნიშნავს — რაც მაღლაა, მით უარესს.",
      "კოშკი = თავდაჯერებულობა. დოინჯი = მზადყოფნა. ცერები გარეთ = ეგო.",
      "ხელების გამუდმებული მოძრაობა საგნებთან — თვითდამამშვიდებელი ჟესტია.",
    ],
    gestures: ["palm-up", "clench-mid", "steeple-up"],
    chapter: "xelis-gulebi",
  },
  {
    id: "head",
    order: 5,
    label: "თავი და სახე",
    at: [100, 52],
    pin: [156, 58],
    r: 34,
    headline: "თავი პირდაპირ, გვერდზე თუ ქვემოთ?",
    look: [
      "გვერდზე გადახრილი თავი = ინტერესი. ქვემოთ დახრილი = კრიტიკა. ნიკაპი წინ = ქედმაღლობა.",
      "ხელი სახესთან: პირი (სიცრუე), ცხვირი (შენიღბული სიცრუე), ყური (არ მინდა მოვისმინო), კისერი (ეჭვი).",
      "ხელზე დაყრდნობილი თავი = მოწყენილობა; ნიკაპს ქვემოთ ხელი = ინტერესი.",
      "განასხვავე ნამდვილი ქავილი სიცრუის ჟესტისგან: ქავილი ენერგიული და ხანგრძლივია.",
    ],
    gestures: ["head-tilt", "nose-touch", "bored"],
    chapter: "tavi",
  },
  {
    id: "eyes",
    order: 6,
    label: "მზერა",
    at: [100, 44],
    pin: [40, 40],
    r: 20,
    headline: "სად უყურებს და რამდენ ხანს?",
    look: [
      "ჯანსაღი მზერის კონტაქტი საუბრის 60–70%-ია. ნაკლები = უნდობლობა, მეტი = ზეწოლა.",
      "შუბლის ზონა = საქმიანი მზერა. თვალები–პირი = სოციალური. ქვემოთ სხეულზე = ინტიმური.",
      "გუგები არავის კონტროლს არ ექვემდებარება: გაფართოებული = ინტერესი, შევიწროებული = უარყოფითი.",
      "დაწეული წამწამები წამზე მეტ ხანს = „შენ აღარ მაინტერესებ“.",
    ],
    gestures: ["business-gaze", "dilated-pupils", "lowered-lids"],
    chapter: "tvalebi",
  },
];

/* ------------------------------------------------------------------
   აქსესუარები
------------------------------------------------------------------- */

interface Accessory {
  id: string;
  label: string;
  at: [number, number];
  pin: [number, number];
  headline: string;
  text: string;
  caution: string;
}

const ACCESSORIES: Accessory[] = [
  {
    id: "glasses",
    label: "სათვალე",
    at: [100, 48],
    pin: [40, 24],
    headline: "სათვალე — სამი ჟესტი, სამი მნიშვნელობა",
    text: "ტარის პირში ჩადება = გადაწყვეტილების გადავადება და დარწმუნების საჭიროება. მოხსნა და გაწმენდა საუბრის შუაში = დროის მოგება. ცხვირწვერზე დაწევა და მის ზემოდან ყურება = ყველაზე კრიტიკული ჟესტი, რომელიც მსმენელს განსჯილად აგრძნობინებს თავს.",
    caution: "თავად სათვალე არაფერს ნიშნავს — მნიშვნელობა მხოლოდ მოძრაობას აქვს.",
  },
  {
    id: "tie",
    label: "ჰალსტუხი / საყელო",
    at: [100, 106],
    pin: [36, 112],
    headline: "საყელო და ჰალსტუხი",
    text: "საყელოს დაჭიმვა სიცრუის ან ბრაზის ნიშანია: სიცრუე კისრის ნაზ კუნთებში შესიების შეგრძნებას იწვევს. ჰალსტუხის გასწორება ან მისი მუდმივი შეხება ასევე მოწესრიგების ჟესტია — ის ჩნდება, როცა ადამიანს ვინმე მოსწონს.",
    caution: "ერთჯერადი გასწორება ჩვევაა. ეძებე გამეორება კონკრეტული თემის დროს.",
  },
  {
    id: "watch",
    label: "საათი",
    at: [143, 190],
    pin: [176, 182],
    headline: "საათი და სამაჯური",
    text: "საათის გასწორება ან მისი ბრუნვა შენიღბული ბარიერია: ხელი სხეულის გასწვრივ მეორე ხელისკენ მიემართება და გზად საგანს ეხება. ბარიერი იქმნება, მაგრამ თავაზიანად. ეს ჟესტი ტიპიურია სცენაზე გამოსვლამდე და უცხო ჯგუფში.",
    caution: "დროის რეალური შემოწმება სხვა მოძრაობაა — ის მზერასაც მოიცავს.",
  },
  {
    id: "ring",
    label: "ბეჭედი",
    at: [62, 202],
    pin: [22, 210],
    headline: "ბეჭედი — ფროიდის დაკვირვება",
    text: "ფროიდმა შენიშნა, რომ მისი პაციენტი დაბეჯითებით ამბობდა „ბედნიერი ვარ ქორწინებაში“ და ამავე დროს ქვეცნობიერად იხსნიდა და იკეთებდა საქორწინო ბეჭედს. მნიშვნელობა აქვს არა ბეჭედს, არამედ იმას, რას აკეთებს მასთან ხელი კონკრეტულ თემაზე საუბრისას.",
    caution: "ბეჭდის ბრუნვა ასევე უბრალო ჩვევაა — მნიშვნელოვანია დროში დამთხვევა.",
  },
  {
    id: "earring",
    label: "საყურე",
    at: [124, 52],
    pin: [172, 36],
    headline: "საყურე — მარჯვენა თუ მარცხენა?",
    text: "მარჯვენა/მარცხენა ყურის „კოდი“ სხვადასხვა კულტურასა და ეპოქაში სხვადასხვას ნიშნავდა და დღეს პრაქტიკულად აღარ მოქმედებს — ეს სოციალური მოდაა, არა არავერბალური სიგნალი. რეალურად ინფორმაციულია მხოლოდ ერთი რამ: რამდენად ხშირად ეხება ადამიანი მას საუბრისას.",
    caution: "ეს ის შემთხვევაა, სადაც ინტერპრეტაცია ყველაზე ხშირად ცდება. არ ააგო დასკვნა აქსესუარზე.",
  },
  {
    id: "bag",
    label: "ჩანთა / ტელეფონი",
    at: [100, 232],
    pin: [170, 246],
    headline: "ნებისმიერი საგანი სხეულის წინ ბარიერია",
    text: "ჩანთა, საქაღალდე, ჭიქა ან ტელეფონი, რომელიც ორივე ხელით სხეულის წინ იჭირება, იგივე ფუნქციას ასრულებს, რასაც გადაჯვარედინებული ხელები. ქალებში ეს ბარიერი ყველაზე რთული შესამჩნევია. საგანი გვერდზე ან მაგიდაზე — პირიქით, ღიაობის ნიშანია.",
    caution: "ჩანთის ტარება თავისთავად არაფერია — მნიშვნელობა აქვს პოზიციას სხეულის მიმართ.",
  },
];

/* ------------------------------------------------------------------
   ფიგურა
------------------------------------------------------------------- */

const LINE = "var(--fig-line)";
const BODY = "var(--fig-body)";

function ReaderFigure({
  accessories,
  activeZone,
  activeAcc,
  onZone,
  onAcc,
}: {
  accessories: Set<string>;
  activeZone: string | null;
  activeAcc: string | null;
  onZone: (id: string) => void;
  onAcc: (id: string) => void;
}) {
  const limb = (d: string, w: number) => (
    <>
      <path d={d} fill="none" stroke={LINE} strokeWidth={w + 5} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={BODY} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    </>
  );

  return (
    <svg viewBox="0 0 200 350" className="size-full" role="img" aria-label="ინტერაქტიული ფიგურა ანოტაციებით">
      <ellipse cx={100} cy={330} rx={54} ry={8} fill="var(--fig-ghost)" />

      {/* ფეხები */}
      {limb("M83 198 L88 254 L86 312", 14)}
      {limb("M117 198 L112 254 L114 312", 14)}
      {limb("M86 312 L70 316", 9)}
      {limb("M114 312 L130 316", 9)}

      {/* ტანი */}
      <path
        d="M71 102 Q67 128 85 178 L83 198 Q100 208 117 198 L115 178 Q133 128 129 102 Q100 93 71 102 Z"
        fill={BODY}
        stroke={LINE}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      {/* საყელო */}
      <path
        d="M89 104 L100 118 L111 104"
        fill="none"
        stroke={accessories.has("tie") ? "var(--fig-accent)" : LINE}
        strokeWidth={accessories.has("tie") ? 3.4 : 2.2}
        strokeLinecap="round"
        opacity={accessories.has("tie") ? 1 : 0.55}
      />
      {accessories.has("tie") && (
        <path d="M100 118 L96 132 L100 162 L104 132 Z" fill="var(--fig-accent)" stroke={LINE} strokeWidth={2} />
      )}

      {/* ხელები */}
      {limb("M71 102 L62 150 L57 198", 11)}
      {limb("M129 102 L138 150 L143 198", 11)}
      <rect x={51} y={191} width={12} height={18} rx={6} fill={BODY} stroke={LINE} strokeWidth={2.8} />
      <rect x={137} y={191} width={12} height={18} rx={6} fill={BODY} stroke={LINE} strokeWidth={2.8} />

      {/* საათი */}
      {accessories.has("watch") && (
        <g>
          <rect x={134} y={182} width={18} height={13} rx={3.5} fill="var(--fig-accent)" stroke={LINE} strokeWidth={2.2} />
          <circle cx={143} cy={188.5} r={3.6} fill="var(--bg-raised)" stroke={LINE} strokeWidth={1.4} />
          <path d="M143 186.4 L143 188.5 L144.8 189.4" stroke={LINE} strokeWidth={1.3} fill="none" strokeLinecap="round" />
        </g>
      )}
      {/* ბეჭედი */}
      {accessories.has("ring") && (
        <circle cx={57} cy={199} r={4.6} fill="none" stroke="var(--fig-accent)" strokeWidth={2.6} />
      )}

      {/* ჩანთა */}
      {accessories.has("bag") && (
        <g>
          <path d="M88 214 Q88 202 100 202 Q112 202 112 214" fill="none" stroke={LINE} strokeWidth={2.4} />
          <rect x={82} y={214} width={36} height={28} rx={4} fill="var(--fig-body-2)" stroke={LINE} strokeWidth={2.6} />
        </g>
      )}

      {/* კისერი */}
      {limb("M100 76 L100 100", 13)}

      {/* თავი */}
      <circle cx={100} cy={52} r={26} fill={BODY} stroke={LINE} strokeWidth={3} />
      {/* სახე */}
      <ellipse cx={90.5} cy={50} rx={4.8} ry={4.1} fill="var(--bg-raised)" stroke={LINE} strokeWidth={2} />
      <ellipse cx={109.5} cy={50} rx={4.8} ry={4.1} fill="var(--bg-raised)" stroke={LINE} strokeWidth={2} />
      <circle cx={90.5} cy={50} r={2.6} fill={LINE} />
      <circle cx={109.5} cy={50} r={2.6} fill={LINE} />
      <path d="M84 40 L97 39.5M103 39.5 L116 40" stroke={LINE} strokeWidth={2.2} strokeLinecap="round" opacity={0.8} />
      <path d="M100 54 L98.5 60 L101.5 60.5" fill="none" stroke={LINE} strokeWidth={1.8} strokeLinecap="round" opacity={0.65} />
      <path d="M94 67.5 Q100 69.5 106 67.5" fill="none" stroke={LINE} strokeWidth={2.2} strokeLinecap="round" />

      {/* სათვალე */}
      {accessories.has("glasses") && (
        <g stroke="var(--fig-accent)" strokeWidth={2.6} fill="none">
          <circle cx={90.5} cy={50} r={8.2} />
          <circle cx={109.5} cy={50} r={8.2} />
          <path d="M98.7 50 L101.3 50" />
          <path d="M82.3 49 L76 47M117.7 49 L124 47" strokeLinecap="round" />
        </g>
      )}
      {/* საყურე */}
      {accessories.has("earring") && (
        <>
          <circle cx={125} cy={56} r={3.6} fill="var(--fig-accent)" stroke={LINE} strokeWidth={1.6} />
          <circle cx={75} cy={56} r={2} fill="none" stroke={LINE} strokeWidth={1.4} opacity={0.4} />
        </>
      )}

      {/* --- ზონების ღილაკები --- */}
      {ZONES.map((z) => {
        const on = activeZone === z.id;
        return (
          <g key={z.id} className="cursor-pointer" onClick={() => onZone(z.id)}>
            <circle
              cx={z.at[0]}
              cy={z.at[1]}
              r={z.r}
              fill={on ? "var(--fig-accent)" : "transparent"}
              fillOpacity={on ? 0.1 : 0}
              stroke={on ? "var(--fig-accent)" : "var(--fig-ghost)"}
              strokeWidth={on ? 2.2 : 1.4}
              strokeDasharray="4 6"
            />
            <circle cx={z.pin[0]} cy={z.pin[1]} r={10.5} fill={on ? "var(--fig-accent)" : "var(--fig-line)"} />
            <text
              x={z.pin[0]}
              y={z.pin[1] + 3.6}
              textAnchor="middle"
              fontSize="10.5"
              fontWeight="700"
              fill="#fff"
              pointerEvents="none"
            >
              {z.order}
            </text>
          </g>
        );
      })}

      {/* --- აქსესუარების ღილაკები --- */}
      {ACCESSORIES.filter((a) => accessories.has(a.id)).map((a) => {
        const on = activeAcc === a.id;
        return (
          <g key={a.id} className="cursor-pointer" onClick={() => onAcc(a.id)}>
            <line
              x1={a.pin[0]}
              y1={a.pin[1]}
              x2={a.at[0]}
              y2={a.at[1]}
              stroke="var(--color-amber)"
              strokeWidth={1.5}
              strokeDasharray="3 4"
              opacity={0.8}
            />
            <circle
              cx={a.pin[0]}
              cy={a.pin[1]}
              r={9}
              fill={on ? "var(--color-amber)" : "var(--bg-raised)"}
              stroke="var(--color-amber)"
              strokeWidth={2.2}
            />
            <text
              x={a.pin[0]}
              y={a.pin[1] + 3.6}
              textAnchor="middle"
              fontSize="10.5"
              fontWeight="700"
              fill={on ? "#fff" : "var(--color-amber)"}
              pointerEvents="none"
            >
              ?
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */

export default function ReaderClient() {
  const [accessories, setAccessories] = React.useState<Set<string>>(
    () => new Set(["glasses", "watch"]),
  );
  const [zone, setZone] = React.useState<string | null>("posture");
  const [acc, setAcc] = React.useState<string | null>(null);

  const toggleAcc = (id: string) =>
    setAccessories((s) => {
      const next = new Set(s);
      if (next.has(id)) {
        next.delete(id);
        if (acc === id) setAcc(null);
      } else next.add(id);
      return next;
    });

  const activeZone = zone ? ZONES.find((z) => z.id === zone) : null;
  const activeAcc = acc ? ACCESSORIES.find((a) => a.id === acc) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
      {/* ფიგურა */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="card grid place-items-center p-4" style={{ background: "var(--bg-sunken)" }}>
          <div className="aspect-[200/350] w-full max-w-[340px]">
            <ReaderFigure
              accessories={accessories}
              activeZone={zone}
              activeAcc={acc}
              onZone={(id) => {
                setZone(id);
                setAcc(null);
              }}
              onAcc={(id) => {
                setAcc(id);
                setZone(null);
              }}
            />
          </div>
        </div>

        <div className="mt-4">
          <p className="eyebrow mb-2">აქსესუარები — ჩართე და დააწკაპუნე „?“-ზე</p>
          <div className="flex flex-wrap gap-1.5">
            {ACCESSORIES.map((a) => {
              const on = accessories.has(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => toggleAcc(a.id)}
                  aria-pressed={on}
                  className="focus-ring rounded-full border px-3 py-1.5 text-[12.5px] transition-all hover:-translate-y-0.5"
                  style={{
                    background: on ? "var(--color-amber)" : "var(--bg-raised)",
                    color: on ? "#fff" : "var(--fg-muted)",
                    borderColor: on ? "var(--color-amber)" : "var(--line)",
                  }}
                >
                  {a.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* პანელი */}
      <div className="grid gap-5">
        {/* ნაბიჯები */}
        <div className="card p-5">
          <p className="eyebrow">წაკითხვის თანმიმდევრობა</p>
          <p className="mt-1.5 text-[13.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
            რიგი შემთხვევითი არ არის: ის ყველაზე გულწრფელი სიგნალიდან ყველაზე შეგნებულისკენ მიდის.
            აქსესუარები ყოველთვის ბოლოს.
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {ZONES.map((z) => (
              <button
                key={z.id}
                type="button"
                onClick={() => {
                  setZone(z.id);
                  setAcc(null);
                }}
                aria-pressed={zone === z.id}
                className="focus-ring flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] transition-all hover:-translate-y-0.5"
                style={{
                  background: zone === z.id ? "var(--brand)" : "var(--bg-raised)",
                  color: zone === z.id ? "#fff" : "var(--fg-muted)",
                  borderColor: zone === z.id ? "var(--brand)" : "var(--line)",
                }}
              >
                <span className="text-[10.5px] font-bold opacity-70">{z.order}</span>
                {z.label}
              </button>
            ))}
          </div>
        </div>

        {/* არჩეული ზონა */}
        {activeZone && (
          <article className="card p-5" key={activeZone.id} data-reveal="up">
            <div className="flex items-center gap-2.5">
              <span
                className="grid size-8 shrink-0 place-items-center rounded-full text-[13px] font-bold"
                style={{ background: "var(--brand)", color: "#fff" }}
              >
                {activeZone.order}
              </span>
              <h2 className="text-[19px]">{activeZone.headline}</h2>
            </div>
            <ul className="mt-4 grid gap-2.5">
              {activeZone.look.map((l, i) => (
                <li key={i} className="flex gap-2.5 text-[14px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                  <span className="mt-2 size-1.5 shrink-0 rounded-full" style={{ background: "var(--color-clay)" }} />
                  {l}
                </li>
              ))}
            </ul>

            {activeZone.gestures.length > 0 && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {activeZone.gestures
                  .map((id) => GESTURE_MAP[id])
                  .filter(Boolean)
                  .map((g) => (
                    <GestureCard key={g.id} gesture={g} compact />
                  ))}
              </div>
            )}

            <Link
              href={`/chapters/${activeZone.chapter}`}
              className="focus-ring mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold"
              style={{ color: "var(--brand)" }}
            >
              სრული თავი
              <ArrowRight className="size-3.5" strokeWidth={2.4} aria-hidden="true" />
            </Link>
          </article>
        )}

        {/* არჩეული აქსესუარი */}
        {activeAcc && (
          <article
            className="card border-l-4 p-5"
            style={{ borderLeftColor: "var(--color-amber)" }}
            key={activeAcc.id}
            data-reveal="up"
          >
            <p className="eyebrow" style={{ color: "var(--color-amber)" }}>
              აქსესუარი
            </p>
            <h2 className="mt-1 text-[19px]">{activeAcc.headline}</h2>
            <p className="mt-2.5 text-[14px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
              {activeAcc.text}
            </p>
            <p
              className="mt-3 rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed"
              style={{ background: "var(--color-clay-wash)", color: "var(--color-clay)" }}
            >
              <strong className="font-semibold">გაფრთხილება: </strong>
              {activeAcc.caution}
            </p>
            <Link
              href="/chapters/garegnoba"
              className="focus-ring mt-4 inline-block text-[13.5px] font-semibold"
              style={{ color: "var(--brand)" }}
            >
              თავი გარეგნობაზე →
            </Link>
          </article>
        )}

        {!activeZone && !activeAcc && (
          <p className="card p-6 text-center text-[14px]" style={{ color: "var(--fg-faint)" }}>
            აირჩიე ზონა ან დააწკაპუნე ფიგურაზე.
          </p>
        )}
      </div>
    </div>
  );
}
