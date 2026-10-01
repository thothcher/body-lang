import { GESTURE_MAP, type Gesture } from "./gestures";

/* ------------------------------------------------------------------
   კავშირები — 4 ჯგუფი × 4 ჟესტი
------------------------------------------------------------------- */

export interface ConnectionGroup {
  title: string;
  hint: string;
  /** სირთულე 1 (ადვილი) → 4 (რთული) */
  level: 1 | 2 | 3 | 4;
  ids: string[];
}

export interface ConnectionPuzzle {
  id: string;
  title: string;
  groups: ConnectionGroup[];
}

export const CONNECTION_PUZZLES: ConnectionPuzzle[] = [
  {
    id: "c1",
    title: "პირველი წრე",
    groups: [
      {
        title: "მზერის ზონები",
        hint: "სად უყურებ — ისაა ურთიერთობის ტიპი",
        level: 1,
        ids: ["business-gaze", "social-gaze", "intimate-gaze", "sideways-glance"],
      },
      {
        title: "უპირატესობის ჟესტები",
        hint: "„მე აქ მთავარი ვარ“",
        level: 2,
        ids: ["behind-back", "hands-behind-head", "hips", "thumbs-pockets"],
      },
      {
        title: "მკლავების ბარიერები",
        hint: "სხეული იცავს თავს",
        level: 3,
        ids: ["arms-crossed", "arms-gripping", "partial-barrier", "self-hug"],
      },
      {
        title: "სიცრუის სიგნალები",
        hint: "ხელი სახესთან მიდის",
        level: 4,
        ids: ["mouth-guard", "nose-touch", "eye-rub", "collar-pull"],
      },
    ],
  },
  {
    id: "c2",
    title: "მეორე წრე",
    groups: [
      {
        title: "ხელის ჩამორთმევა",
        hint: "პირველი სამი წამი",
        level: 1,
        ids: ["shake-dominant", "shake-submissive", "shake-equal", "shake-weak"],
      },
      {
        title: "თავის პოზიციები",
        hint: "ოთხი კუთხე, ოთხი განწყობა",
        level: 2,
        ids: ["head-neutral", "head-tilt", "head-down", "head-up"],
      },
      {
        title: "ფეხები",
        hint: "სხეულის ყველაზე გულწრფელი ნაწილი",
        level: 3,
        ids: ["legs-crossed-sit", "figure-four", "ankle-lock", "open-stance"],
      },
      {
        title: "ხელი სახესთან — შეფასება",
        hint: "სანტიმეტრები წყვეტენ",
        level: 4,
        ids: ["bored", "evaluation", "critical", "chin-stroke"],
      },
    ],
  },
  {
    id: "c3",
    title: "მესამე წრე",
    groups: [
      {
        title: "კულტურაზე დამოკიდებული",
        hint: "ერთგან კარგი, სხვაგან შეურაცხყოფა",
        level: 1,
        ids: ["ok-sign", "thumb-up", "v-sign", "palm-open-hand"],
      },
      {
        title: "ხელის გულების ენა",
        hint: "ერთი კუთხე ცვლის ყველაფერს",
        level: 2,
        ids: ["palm-up", "palm-down", "pointing-finger", "money-rub"],
      },
      {
        title: "იმედგაცრუება",
        hint: "რაც მაღლაა, მით უარესი",
        level: 3,
        ids: ["clench-high", "clench-mid", "clench-low", "behind-back-wrist"],
      },
      {
        title: "ეჭვი და გაურკვევლობა",
        hint: "„არ ვარ დარწმუნებული“",
        level: 4,
        ids: ["ear-scratch", "neck-scratch", "fingers-mouth", "fake-cough"],
      },
    ],
  },
];

export const GROUP_COLOR: Record<number, { bg: string; fg: string }> = {
  1: { bg: "var(--color-sage-wash)", fg: "var(--color-sage)" },
  2: { bg: "var(--color-amber-wash)", fg: "var(--color-amber)" },
  3: { bg: "var(--color-indigo-wash)", fg: "var(--color-indigo)" },
  4: { bg: "var(--color-clay-wash)", fg: "var(--color-clay)" },
};

/* ------------------------------------------------------------------
   სცენის გაშიფვრა
------------------------------------------------------------------- */

export interface Scene {
  id: string;
  /** სიტუაციის აღწერა */
  setup: string;
  /** რას ამბობს ადამიანი */
  says?: string;
  /** ჟესტების მტევანი — პირველი ილუსტრირდება */
  cluster: string[];
  question: string;
  options: string[];
  answer: number;
  explain: string;
  chapter: string;
}

export const SCENES: Scene[] = [
  {
    id: "s1",
    setup: "მოლაპარაკების მაგიდასთან ხარ. პრეზენტაცია დაასრულე და კლიენტს პასუხს ელოდები.",
    says: "„საინტერესო წინადადებაა, ვიფიქრებ.“",
    cluster: ["arms-crossed", "head-down", "critical"],
    question: "რას ამბობს სინამდვილეში?",
    options: [
      "ის მართლაც დაინტერესდა და დრო სჭირდება",
      "ის უარყოფითად არის განწყობილი — სიტყვები თავაზიანობაა",
      "ის დაღლილია და კონცენტრაცია აკლია",
      "ის ფიქრობს ფასზე",
    ],
    answer: 1,
    explain:
      "სამი ჟესტი ერთსა და იმავეზე მიუთითებს: ბარიერი, ჩაღუნული თავი და კრიტიკული შეფასება. სიტყვა და სხეული არაკონგრუენტულია — დაიჯერე სხეული.",
    chapter: "sami-tsesi",
  },
  {
    id: "s2",
    setup: "კანდიდატს გასაუბრებაზე სვამ კითხვას წინა სამსახურიდან წამოსვლის მიზეზზე.",
    says: "„უბრალოდ ახალი გამოწვევა მინდოდა.“",
    cluster: ["nose-touch", "collar-pull", "gaze-avoid"],
    question: "რა უნდა გააკეთო შემდეგ?",
    options: [
      "მაშინვე უთხრა, რომ ტყუის",
      "დაასრულო გასაუბრება",
      "სთხოვო გაიმეოროს და დააკვირდე, გამეორდება თუ არა კლასტერი",
      "თემა შეცვალო, რომ არ შეარცხვინო",
    ],
    answer: 2,
    explain:
      "ერთი კლასტერი ჰიპოთეზაა, არა მტკიცებულება. გამეორების თხოვნა ამოწმებს ვერსიას — ტყუილის გამეორება უფრო რთულია, ვიდრე პირველად თქმა.",
    chapter: "sicrue",
  },
  {
    id: "s3",
    setup: "წვეულებაზე მიდიხარ ჯგუფთან, რომელიც უკვე საუბრობს.",
    cluster: ["legs-crossed-stand", "partial-barrier"],
    question: "ჯგუფის წევრებმა მხოლოდ თავები მოგაბრუნეს, ტანი არა. რას ნიშნავს?",
    options: [
      "გეპატიჟებიან შემოსვლაში",
      "ისინი ჯერ არ ხსნიან წრეს — შენ არ გეპატიჟებიან",
      "ისინი არ გამჩნევიან",
      "საუბარი დასასრულს უახლოვდება",
    ],
    answer: 1,
    explain:
      "თავის მობრუნება თავაზიანობაა; ტანის მობრუნება მიწვევაა. თუ სამკუთხედი არ გაიხსნა, ჯგუფი დახურულ ფორმაციაშია.",
    chapter: "sarke",
  },
  {
    id: "s4",
    setup: "გამყიდველი პროდუქტს გიწერს და შემდეგ ჩუმდება.",
    cluster: ["steeple-up", "head-up"],
    question: "კოშკის ჟესტი და უკან გადაწეული თავი რას ნიშნავს?",
    options: [
      "ის უკვე დაგეთანხმა",
      "ის თავდაჯერებულია — მაგრამ „კი“ თუ „არა“, მომდევნო ჟესტები იტყვის",
      "ის ნერვიულობს",
      "ის მოწყენილია",
    ],
    answer: 1,
    explain:
      "კოშკი თავდაჯერებულობის სიგნალია და გამონაკლისია იზოლირებული ჟესტების წესიდან. პასუხი მომდევნო კლასტერშია: წინ გადახრა = კი, უკან გადახრა + გადაჯვარედინება = არა.",
    chapter: "xelebis-zhestebi",
  },
  {
    id: "s5",
    setup: "ლექციას კითხულობ. აუდიტორიის ნახევარმა პოზა შეიცვალა.",
    cluster: ["bored", "arms-crossed"],
    question: "რა არის სწორი რეაქცია?",
    options: [
      "გააგრძელო იმავე ტემპით — მალე დაბრუნდებიან",
      "შეცვალო ტემპი, დასვა კითხვა ან მიეცე რამე ხელში",
      "უფრო ხმამაღლა ისაუბრო",
      "უფრო სწრაფად დაასრულო",
    ],
    answer: 1,
    explain:
      "გადაჯვარედინებულ პოზაში მსმენელი 38%-ით ნაკლებს იმახსოვრებს და უფრო კრიტიკულად აფასებს. პოზის გატეხვა მდგომარეობასაც ცვლის — არა მხოლოდ სიგნალს.",
    chapter: "xelebis-barieri",
  },
  {
    id: "s6",
    setup: "სამსახურში კოლეგას ეკითხები, შეასრულა თუ არა დავალება.",
    says: "„ოჰ, სრულიად დამავიწყდა!“",
    cluster: ["forehead-slap"],
    question: "რას გეუბნება ეს ჟესტი მის ხასიათზე?",
    options: [
      "ის კრიტიკული და უარყოფითი ადამიანია",
      "ის ღია და თვინიერია — შეცდომის აღიარება არ აშინებს",
      "ის ტყუის",
      "ის გაღიზიანებულია",
    ],
    answer: 1,
    explain:
      "შუბლზე ხელის მირტყმა ღიაობას ნიშნავს. იგივე შეცდომა კეფაზე ხელის მოსობით — უხერხულობასა და კრიტიკულობას გამოხატავს.",
    chapter: "mostsqeniloba",
  },
  {
    id: "s7",
    setup: "ორივემ დიდხანს ისაუბრეთ. მან ნიკაპის მოსრესვა დაიწყო.",
    cluster: ["chin-stroke"],
    question: "რა არის ამ წამში ყველაზე ძლიერი ნაბიჯი?",
    options: [
      "დაამატო კიდევ ერთი არგუმენტი",
      "გაჩუმდე და დაელოდო მომდევნო ჟესტს",
      "ფასდაკლება შესთავაზო",
      "შეხვედრა გადადო",
    ],
    answer: 1,
    explain:
      "ნიკაპის მოსრესვა გადაწყვეტილების მიღების მომენტია. ყოველი დამატებითი სიტყვა ამ წამში ზიანს აყენებს — პასუხი მომდევნო ჟესტებში იკითხება.",
    chapter: "mostsqeniloba",
  },
  {
    id: "s8",
    setup: "ზამთარია. ავტობუსის გაჩერებაზე ადამიანი ხელებს ისრესს და გულზე იჯვარედინებს.",
    cluster: ["rub-palms", "arms-crossed"],
    question: "რა არის ყველაზე სავარაუდო ახსნა?",
    options: [
      "ის დადებით შედეგს ელოდება და ამავე დროს თავს იცავს",
      "მას უბრალოდ სცივა — კონტექსტი ჟესტს ანულებს",
      "ის ტყუის",
      "ის ვინმეს ელოდება ბრაზით",
    ],
    answer: 1,
    explain:
      "წესი 3 — კონტექსტი. სიცივე ორივე ჟესტის ტრივიალურ ახსნას იძლევა. ჟესტების კითხვა იქ იწყება, სადაც ფიზიკური მიზეზი გამორიცხულია.",
    chapter: "sami-tsesi",
  },
];

/* ------------------------------------------------------------------
   დამხმარეები
------------------------------------------------------------------- */

export function gesturesOf(ids: string[]): Gesture[] {
  return ids.map((id) => GESTURE_MAP[id]).filter(Boolean);
}

/** დეტერმინისტული არევა — სერვერისა და კლიენტის სინქრონისთვის. */
export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let s = seed || 1;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) % 2147483648;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
