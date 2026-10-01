/**
 * ინტერპრეტაციის ძრავა — სიგნალების ნაკრებიდან კითხულობს „რას ამბობს სხეული“.
 * ყოველი სიგნალი აწონის ოთხ ღერძს: ღიაობა, დომინირება, ჩართულობა, დაძაბულობა.
 */

export interface SignalInfo {
  label: string;
  reading: string;
  /** −1 … 1 */
  open: number;
  dominance: number;
  engagement: number;
  tension: number;
  chapter: string;
}

export const SIGNALS: Record<string, SignalInfo> = {
  /* --- ხელები --- */
  neutral: {
    label: "ხელები ჩამოშვებული",
    reading: "ნეიტრალური საწყისი — ჯერ არაფერს ამბობს.",
    open: 0.1, dominance: 0, engagement: 0, tension: 0,
    chapter: "xelebis-zhestebi",
  },
  "palms-open": {
    label: "გაშლილი ხელის გულები",
    reading: "„ვერაფერს ვმალავ“ — გულწრფელობის უძველესი სიგნალი.",
    open: 0.9, dominance: -0.1, engagement: 0.4, tension: -0.4,
    chapter: "xelis-gulebi",
  },
  "arms-crossed": {
    label: "გადაჯვარედინებული ხელები",
    reading: "ბარიერი. სანამ პოზაა, უარყოფითი განწყობაც რჩება — და 38%-ით ნაკლები იმახსოვრება.",
    open: -0.9, dominance: 0.1, engagement: -0.5, tension: 0.6,
    chapter: "xelebis-barieri",
  },
  steeple: {
    label: "კოშკი",
    reading: "თავდაჯერებულობა და „ყოვლისმცოდნე“ პოზიცია. მაგრამ ეს არც კი-ა, არც არა.",
    open: 0.1, dominance: 0.8, engagement: 0.3, tension: -0.2,
    chapter: "xelebis-zhestebi",
  },
  "behind-back": {
    label: "ხელები ზურგს უკან",
    reading: "უშიშრობა — სხეულის დაუცველი ნაწილები გახსნილია. ტიპიურია ლიდერებისთვის.",
    open: 0.3, dominance: 0.8, engagement: 0, tension: -0.3,
    chapter: "xelebis-zhestebi",
  },
  hips: {
    label: "დოინჯი",
    reading: "მზადყოფნა მოქმედებისთვის. სხეული ვიზუალურად დიდდება და ტერიტორიას იკავებს.",
    open: -0.1, dominance: 0.9, engagement: 0.4, tension: 0.4,
    chapter: "xelebis-zhestebi",
  },
  "hands-behind-head": {
    label: "თავზე ხელები",
    reading: "„მე ყველაფერი ვიცი“. თუ ფეხიც ფეხზეა გადადებული — კამათისთვისაა მზად.",
    open: 0.1, dominance: 0.95, engagement: -0.1, tension: -0.3,
    chapter: "tavi",
  },
  pointing: {
    label: "თითით მითითება",
    reading: "სიმბოლური კეტი — ყველაზე უარყოფითად აღქმადი ჟესტი. შეცვალე ხელის გულით.",
    open: -0.6, dominance: 0.85, engagement: 0.5, tension: 0.7,
    chapter: "xelis-gulebi",
  },
  "face-touch": {
    label: "ხელი სახესთან",
    reading: "სიცრუის ან ეჭვის ოჯახი: პირის დაფარვა, ცხვირზე შეხება, კისრის მოფხანა.",
    open: -0.4, dominance: -0.2, engagement: 0.1, tension: 0.8,
    chapter: "sicrue",
  },
  "self-hug": {
    label: "თავის ჩაჭერა",
    reading: "ემოციური უსაფრთხოების აღდგენის მცდელობა — ბავშვობის ჟესტის ზრდასრული ვერსია.",
    open: -0.7, dominance: -0.7, engagement: -0.2, tension: 0.8,
    chapter: "xelebis-barieri",
  },
  handshake: {
    label: "ხელის ჩამორთმევა",
    reading: "ძალაუფლების განაწილების მომენტი. ხელის გულის კუთხე წყვეტს ყველაფერს.",
    open: 0.5, dominance: 0.2, engagement: 0.7, tension: 0,
    chapter: "xelis-gulebi",
  },

  /* --- ფეხები --- */
  "legs-neutral": {
    label: "ფეხები ნეიტრალურად",
    reading: "სტაბილური, არც ღია, არც დახურული.",
    open: 0.1, dominance: 0, engagement: 0, tension: 0,
    chapter: "fexebi",
  },
  "open-stance": {
    label: "ღია სტოიკა",
    reading: "წონა თანაბრად, სხეული გახსნილი — თავდაჯერებულობა და მისაღები განწყობა.",
    open: 0.7, dominance: 0.4, engagement: 0.3, tension: -0.4,
    chapter: "fexebi",
  },
  "legs-closed": {
    label: "ფეხები ერთად",
    reading: "ოფიციალური ან დაძაბული პოზიცია — ხშირია უცნობ გარემოში.",
    open: -0.2, dominance: -0.2, engagement: 0, tension: 0.3,
    chapter: "fexebi",
  },
  "legs-crossed": {
    label: "გადაჯვარედინებული ფეხები",
    reading: "არასტაბილური პოზა — მას მხოლოდ მაშინ იღებენ, როცა თავს უსაფრთხოდ არ გრძნობენ.",
    open: -0.6, dominance: -0.3, engagement: -0.3, tension: 0.5,
    chapter: "fexebi",
  },
  "weight-shift": {
    label: "წონა ერთ ფეხზე",
    reading: "მოდუნება — ან მოუთმენლობა. კონტექსტი გადაწყვეტს.",
    open: 0.2, dominance: 0, engagement: -0.2, tension: 0.1,
    chapter: "fexebi",
  },
  "foot-forward": {
    label: "ერთი ფეხი წინ",
    reading: "ფეხი მიუთითებს იქით, სადაც ინტერესია — ან სად უნდა წასვლა.",
    open: 0.3, dominance: 0.2, engagement: 0.6, tension: 0,
    chapter: "fexebi",
  },

  /* --- თავი --- */
  "head-neutral": {
    label: "თავი პირდაპირ",
    reading: "ნეიტრალური მოსმენა — არც თანხმობა, არც უარყოფა.",
    open: 0.1, dominance: 0.1, engagement: 0.1, tension: 0,
    chapter: "tavi",
  },
  "head-tilt": {
    label: "თავი გვერდზე",
    reading: "ინტერესი. დარვინმა შენიშნა, რომ ეს ცხოველებთანაც ასეა.",
    open: 0.7, dominance: -0.2, engagement: 0.9, tension: -0.3,
    chapter: "tavi",
  },
  "head-down": {
    label: "თავი ქვემოთ",
    reading: "განმსჯელი, კრიტიკული დამოკიდებულება. თან სდევს კრიტიკული ჟესტების რიგი.",
    open: -0.6, dominance: 0.2, engagement: -0.4, tension: 0.5,
    chapter: "tavi",
  },
  "head-up": {
    label: "ნიკაპი წინ",
    reading: "უშიშრობა და ქედმაღლობა — ყელი გახსნილია, მზერა ცხვირწვერიდან.",
    open: 0.1, dominance: 0.85, engagement: 0.1, tension: 0.1,
    chapter: "tavi",
  },
  "head-away": {
    label: "თავი გვერდზე მობრუნებული",
    reading: "დისტანცირება — ყურადღება სხვაგანაა ან თემა არასასიამოვნოა.",
    open: -0.5, dominance: 0, engagement: -0.7, tension: 0.4,
    chapter: "tavi",
  },

  /* --- მზერა --- */
  "gaze-direct": {
    label: "პირდაპირი მზერა",
    reading: "კონტაქტი. ჯანსაღი დიაპაზონია საუბრის 60–70%.",
    open: 0.5, dominance: 0.3, engagement: 0.8, tension: 0,
    chapter: "tvalebi",
  },
  "gaze-business": {
    label: "საქმიანი მზერა",
    reading: "შუბლის სამკუთხედი — სერიოზული ატმოსფერო და კონტროლი მოლაპარაკებაზე.",
    open: 0, dominance: 0.7, engagement: 0.6, tension: 0.2,
    chapter: "tvalebi",
  },
  "gaze-social": {
    label: "სოციალური მზერა",
    reading: "თვალები–პირის სამკუთხედი — მეგობრული, არაფორმალური ტონი.",
    open: 0.6, dominance: -0.1, engagement: 0.6, tension: -0.3,
    chapter: "tvalebi",
  },
  "gaze-side": {
    label: "გვერდითი მზერა",
    reading: "ორაზროვანი: აწეულ წარბებთან — ინტერესი, ჩამოწეულთან — ეჭვი.",
    open: 0, dominance: 0.1, engagement: -0.2, tension: 0.4,
    chapter: "tvalebi",
  },
  "gaze-avoid": {
    label: "მზერის არიდება",
    reading: "დისკომფორტი — არა აუცილებლად სიცრუე. ხშირად უხერხულობა ან კულტურული ნორმა.",
    open: -0.5, dominance: -0.6, engagement: -0.6, tension: 0.6,
    chapter: "tvalebi",
  },
  "lids-lowered": {
    label: "დაწეული წამწამები",
    reading: "„შენ აღარ მაინტერესებ“ — ქვეცნობიერი მცდელობა მოგაშოროს მხედველობიდან.",
    open: -0.6, dominance: 0.6, engagement: -0.8, tension: 0.2,
    chapter: "tvalebi",
  },

  /* --- პოზა --- */
  "posture-neutral": {
    label: "ნეიტრალური პოზა",
    reading: "სწორი ზურგი, მოდუნებული მხრები.",
    open: 0.2, dominance: 0.1, engagement: 0.1, tension: 0,
    chapter: "fexebi",
  },
  "posture-confident": {
    label: "თავდაჯერებული პოზა",
    reading: "გახსნილი მკერდი და უკან გაშლილი მხრები — სივრცის დაკავება.",
    open: 0.6, dominance: 0.7, engagement: 0.3, tension: -0.5,
    chapter: "fexebi",
  },
  "posture-slouched": {
    label: "მოხრილი პოზა",
    reading: "სხეული ვიზუალურად მცირდება — დაბალი ენერგია ან დაუცველობა.",
    open: -0.4, dominance: -0.8, engagement: -0.5, tension: 0.4,
    chapter: "fexebi",
  },
  "lean-in": {
    label: "წინ გადახრა",
    reading: "ჩართულობა — ადამიანი დისტანციას თავისით ამცირებს.",
    open: 0.6, dominance: 0.2, engagement: 0.9, tension: -0.2,
    chapter: "sivrce",
  },
  "lean-back": {
    label: "უკან გადახრა",
    reading: "დისტანცია და შეფასება. ხშირად უარყოფითი გადაწყვეტილების თანმხლები.",
    open: -0.4, dominance: 0.3, engagement: -0.5, tension: 0.2,
    chapter: "mostsqeniloba",
  },
  "turn-away": {
    label: "ტანი გვერდზე",
    reading: "ნაწილობრივი დახურვა — სხეული სრულად არ არის შენსკენ მიმართული.",
    open: -0.5, dominance: 0, engagement: -0.6, tension: 0.3,
    chapter: "sarke",
  },

  /* --- ტანსაცმელი --- */
  "outfit-casual": {
    label: "ყოველდღიური ტანსაცმელი",
    reading: "თავისუფალი მოძრაობა — სხეულის ენა ბუნებრივად იკითხება.",
    open: 0.2, dominance: -0.1, engagement: 0, tension: -0.1,
    chapter: "garegnoba",
  },
  "outfit-formal": {
    label: "ოფიციალური ტანსაცმელი",
    reading: "ვიწრო ტანსაცმელი მოძრაობას ზღუდავს — ჟესტები უფრო შეკავებულია.",
    open: -0.1, dominance: 0.4, engagement: 0, tension: 0.2,
    chapter: "garegnoba",
  },
};

export interface Axis {
  id: string;
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
}

export interface Reading {
  axes: Axis[];
  signals: SignalInfo[];
  verdict: { title: string; text: string; tone: string };
  /** განსაკუთრებული კომბინაციები */
  combos: { title: string; text: string }[];
}

const COMBOS: { needs: string[]; title: string; text: string }[] = [
  {
    needs: ["arms-crossed", "legs-crossed"],
    title: "ორმაგი ბარიერი",
    text: "ხელებიც და ფეხებიც დახურულია — ეს უკვე სამი წესიდან „მტევნის“ პირობა სრულდება. ამ მდგომარეობაში არგუმენტები არ მუშაობს. ჯერ გახსენი პოზა: მიეცი რამე ხელში.",
  },
  {
    needs: ["arms-crossed", "head-down"],
    title: "კრიტიკული მტევანი",
    text: "ბარიერი + ჩაღუნული თავი. თარგმანი: „არ მომწონს, რასაც ამბობთ“. შეწყვიტე მონოლოგი და დასვი ღია კითხვა.",
  },
  {
    needs: ["hands-behind-head", "legs-crossed"],
    title: "„ყოვლისმცოდნე“ + კამათი",
    text: "თავზე ხელები ფეხის გადადებასთან ერთად ნიშნავს, რომ ადამიანი მზადაა კამათისთვის. საუკეთესო პასუხი — იგივე პოზის მიღება.",
  },
  {
    needs: ["face-touch", "gaze-avoid"],
    title: "სიცრუის კლასტერი",
    text: "ხელი სახესთან + მზერის არიდება. ეს ჰიპოთეზაა, არა მტკიცებულება — სთხოვე გაიმეოროს ნათქვამი და დააკვირდი, გამეორდება თუ არა კლასტერი.",
  },
  {
    needs: ["palms-open", "lean-in"],
    title: "სრული ღიაობა",
    text: "გაშლილი ხელის გულები + წინ გადახრა. ეს იდეალური მდგომარეობაა მოლაპარაკებისთვის — ადამიანი მოსმენისთვისაც და დათანხმებისთვისაც მზადაა.",
  },
  {
    needs: ["hips", "head-up"],
    title: "დომინირების ჩვენება",
    text: "დოინჯი + წინ გამოწეული ნიკაპი. სხეული მაქსიმალურად დიდდება. ეს ან მზადყოფნაა, ან გაფრთხილება.",
  },
  {
    needs: ["steeple", "lean-back"],
    title: "თავდაჯერებული შეფასება",
    text: "კოშკი უკან გადახრასთან ერთად: ადამიანი თავს ექსპერტად თვლის და გაფასებს. მოუსმინე მეტს, ილაპარაკე ნაკლები.",
  },
  {
    needs: ["self-hug", "posture-slouched"],
    title: "დაუცველობის სურათი",
    text: "თავის ჩაჭერა + მოხრილი პოზა. ეს ადამიანი ემოციურ უსაფრთხოებას ეძებს. ზეწოლა აქ საწინააღმდეგო შედეგს მოგცემს.",
  },
  {
    needs: ["pointing", "head-up"],
    title: "აგრესიული მითითება",
    text: "თითი + ქედმაღლური თავი. ყველაზე ცუდი კომბინაცია დამაჯერებლობისთვის — მსმენელები ნათქვამს უარესად იმახსოვრებენ.",
  },
];

function clamp(v: number) {
  return Math.max(-1, Math.min(1, v));
}

export function readSignals(signalIds: string[]): Reading {
  const signals = signalIds.map((id) => SIGNALS[id]).filter(Boolean);
  const n = Math.max(1, signals.length);

  const sum = signals.reduce(
    (a, s) => ({
      open: a.open + s.open,
      dominance: a.dominance + s.dominance,
      engagement: a.engagement + s.engagement,
      tension: a.tension + s.tension,
    }),
    { open: 0, dominance: 0, engagement: 0, tension: 0 },
  );

  // ნორმალიზება — ოდნავ გაძლიერებული, რომ ცვლილება შესამჩნევი იყოს
  const norm = (v: number) => clamp((v / n) * 1.45);

  const axes: Axis[] = [
    { id: "open", label: "ღიაობა", leftLabel: "დახურული", rightLabel: "ღია", value: norm(sum.open) },
    { id: "dominance", label: "სტატუსი", leftLabel: "მორჩილი", rightLabel: "დომინანტი", value: norm(sum.dominance) },
    { id: "engagement", label: "ჩართულობა", leftLabel: "გამოთიშული", rightLabel: "ჩართული", value: norm(sum.engagement) },
    { id: "tension", label: "დაძაბულობა", leftLabel: "მშვიდი", rightLabel: "დაძაბული", value: norm(sum.tension) },
  ];

  const open = axes[0].value;
  const dom = axes[1].value;
  const eng = axes[2].value;
  const ten = axes[3].value;

  let verdict = {
    title: "ნეიტრალური სურათი",
    text: "სიგნალები ერთმანეთს აბალანსებს. ასეთ მდგომარეობაში დასკვნის გამოტანა ნაადრევია — დააკვირდი, რა შეიცვლება, როცა თემა შეიცვლება.",
    tone: "var(--color-slate-cool)",
  };

  if (ten > 0.45 && open < -0.1) {
    verdict = {
      title: "დახურული და დაძაბული",
      text: "სხეული ბარიერებს აშენებს. სანამ პოზა არ გაიხსნება, არგუმენტები არ იმუშავებს — ჯერ ფიზიკურად გახსენი: მიეცი რამე ხელში ან შეცვალე ადგილი.",
      tone: "var(--color-clay)",
    };
  } else if (open > 0.4 && eng > 0.3) {
    verdict = {
      title: "ღია და ჩართული",
      text: "საუკეთესო მდგომარეობა საუბრისთვის. ადამიანი მოსმენისთვისაც მზადაა და დათანხმებისთვისაც. ეს ის მომენტია, როცა თხოვნა ან წინადადება უნდა გამოთქვა.",
      tone: "var(--color-sage)",
    };
  } else if (dom > 0.5) {
    verdict = {
      title: "დომინირების პოზიცია",
      text: "სხეული სივრცეს იკავებს და სტატუსს აცხადებს. პირდაპირი დაპირისპირება არაეფექტურია — სარკისებური რეაქცია ბალანსს უფრო სწრაფად აღადგენს.",
      tone: "var(--color-indigo)",
    };
  } else if (dom < -0.35) {
    verdict = {
      title: "მორჩილი პოზიცია",
      text: "სხეული მცირდება. ასეთ ადამიანს ჯერ უსაფრთხოების შეგრძნება სჭირდება — შეამცირე ზეწოლა, გახსენი საკუთარი ხელის გულები და დაელოდე.",
      tone: "var(--color-amber)",
    };
  } else if (eng < -0.35) {
    verdict = {
      title: "ყურადღება დაკარგულია",
      text: "სიგნალები ამბობს, რომ ადამიანი გამოთიშულია. ტემპის შენარჩუნება მდგომარეობას გააუარესებს — დასვი კითხვა ან შეცვალე ფორმატი.",
      tone: "var(--color-amber)",
    };
  } else if (ten > 0.4) {
    verdict = {
      title: "დაძაბულობის ნიშნები",
      text: "სხეული უფრო მეტ დაძაბულობას ამჟღავნებს, ვიდრე სიტუაცია მოითხოვს. ეს ან შფოთვაა, ან დაფარული უთანხმოება — ორივე შემთხვევაში ჯერ მიზეზი უნდა იპოვო.",
      tone: "var(--color-amber)",
    };
  }

  const ids = new Set(signalIds);
  const combos = COMBOS.filter((c) => c.needs.every((need) => ids.has(need))).map(({ title, text }) => ({
    title,
    text,
  }));

  return { axes, signals, verdict, combos };
}
