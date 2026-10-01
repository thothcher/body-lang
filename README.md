# სხეულის ენა — Body Language

ინტერაქტიული ქართული სასწავლო პლატფორმა სხეულის ენაზე, აგებული **ალან პიზის წიგნზე
„სხეულის ენა“** (ქართული თარგმანი, `516501829-311797400-ალან-პიზი-სხეულის-ენა.pdf`).

## რა არის შიგნით

| ნაწილი | მისამართი | აღწერა |
| --- | --- | --- |
| თავები | `/chapters`, `/chapters/[slug]` | 14 თავი: სექციები, ილუსტრაციები, „დასამახსოვრებელი ბირთვი“, შეჯამება და მინი-ტესტი |
| ჟესტების ბიბლიოთეკა | `/chapters` (ქვედა ნაწილი) | 67 ჟესტი, ფილტრი სხეულის ნაწილისა და ტონის მიხედვით, შენახვა |
| ტესტები | `/test`, `/test/[topic]` | ზოგადი, თემატური (ხელები, სახე, თვალები, მკლავები, ფეხები, თავი) და თითო თავზე |
| თამაშები | `/games/guess`, `/memory`, `/connections`, `/decode` | გამოცნობა ტაიმერით, მეხსიერების ბანქო, NYT-ის სტილის „კავშირები“, სცენის გაშიფვრა |
| 3D სტუდია | `/studio` | ცოცხალი 3D ავატარი — ხელები, ფეხები, თავი, მზერა, პოზა, ტანსაცმელი + რეალურ დროში ინტერპრეტაცია |
| ადამიანის წაკითხვა | `/reader` | ინტერაქტიული ფიგურა 6 ზონით და აქსესუარებით (სათვალე, საათი, ბეჭედი, საყურე, ჩანთა) |
| პროგრესი | `/progress` | წაკითხული თავები, ტესტების შედეგები, თამაშების რეკორდები, შენახული ჟესტები |

## ტექნოლოგიები

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — დიზაინის ტოკენები `src/app/globals.css`-ში (`@theme`)
- **three.js / @react-three/fiber / drei** — 3D ავატარი
- **next/font** — Noto Sans/Serif Georgian, თვით-ჰოსტირებული

გარე გრაფიკული ფაილები არ გამოიყენება: **ყველა ილუსტრაცია პარამეტრული SVG-ია**
(`src/components/figures/`), ხოლო 3D მოდელი პროცედურულად აიგება პრიმიტივებისგან.

## სტრუქტურა

```
src/
├─ app/                    # მარშრუტები, sitemap, robots, manifest
├─ components/
│  ├─ figures/             # BodyFigure, SeatedFigure, HandSign, FaceSignal, Diagrams
│  │  └─ poses.ts          # ყველა პოზის კოორდინატები
│  ├─ three/               # Avatar, StudioScene, rig.ts (3D პოზების პრესეტები)
│  ├─ games/ quiz/ reader/ studio/ progress/
│  ├─ layout/              # Header, Footer, CustomCursor, SearchDialog, ThemeToggle
│  ├─ motion/              # RevealObserver (საკუთარი AOS), Parallax
│  └─ ui/                  # Primitives, GestureCard, ChapterCard, ChapterBrowser
└─ lib/
   ├─ content/             # chapters.ts, gestures.ts, quiz.ts, games.ts
   ├─ progress.tsx         # localStorage-ის კონტექსტი
   ├─ reading.ts           # 3D სტუდიის ინტერპრეტაციის ძრავა
   └─ seo.tsx              # JSON-LD დამხმარეები
```

## გაშვება

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm run start
```

### გარემოს ცვლადი

```
NEXT_PUBLIC_SITE_URL=https://your-domain.tld
```

გამოიყენება canonical URL-ებში, `sitemap.xml`-სა და `robots.txt`-ში. თუ არ არის
მითითებული, გამოიყენება placeholder `src/lib/seo.tsx`-დან.

## GitHub Pages

საიტი: **https://thothcher.github.io/body-lang/**

```bash
npm run deploy     # სტატიკური ექსპორტი → gh-pages ბრანჩი
```

`scripts/deploy-pages.mjs` აგებს საიტს `/body-lang` ქვე-მისამართისთვის და აქვეყნებს
`gh-pages` ბრანჩზე, საიდანაც GitHub Pages ემსახურება. `main`-ზე push-ისას იგივეს
ავტომატურად აკეთებს GitHub Actions (`.github/workflows/deploy-pages.yml`).

## შენიშვნები

- **მონაცემები** — პროგრესი, ტესტების შედეგები და შენახული ჟესტები ინახება მხოლოდ
  `localStorage`-ში (`sxeulis-ena:v1`). სერვერზე არაფერი იგზავნება.
- **წვდომადობა** — `prefers-reduced-motion` გამორთავს ყველა ანიმაციას; კურსორი
  მხოლოდ მაუსიან მოწყობილობებზე ირთვება; ყველა ინტერაქტიულ ელემენტს აქვს
  ხილული ფოკუსი და ARIA-ეტიკეტი.
- **SEO** — თითოეულ გვერდს აქვს საკუთარი metadata, canonical და JSON-LD
  (`Course`, `Article`, `BreadcrumbList`, `FAQPage`).
- მასალა საგანმანათლებლო დანიშნულებისაა და ეყრდნობა ალან პიზის წიგნს.
