import type { Metadata, Viewport } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const orbitron = Orbitron({ subsets: ["latin"], variable: '--font-orbitron' });



export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

/**
 * The single canonical home of the DeepSafe site.
 *
 * This codebase is published from two GitHub Pages sites — `simo-hue/DeepSafe`
 * (the canonical one) and the upstream `deep-safe/DeepSafe` — which is duplicate
 * content. Because BOTH are built from this same constant, whichever host serves
 * a page, it declares the same canonical, and search engines consolidate onto the
 * URL below. That means the upstream copy must also be redeployed for its
 * canonical to take effect.
 *
 * Previously this was `https://deepsafe.app`, which does not respond over HTTPS —
 * so every og:url and resolved image URL pointed at a dead host.
 */
const SITE_URL = 'https://simo-hue.github.io/DeepSafe';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: `${SITE_URL}/`,
  },
  title: {
    default: "DeepSafe - Impara la Sicurezza Digitale Giocando (Gratis)",
    template: "%s | DeepSafe"
  },
  description: "Il Duolingo della vita digitale. La piattaforma italiana per le competenze digitali. Impara cybersecurity, privacy e fake news giocando 5 minuti al giorno.",
  keywords: ["competenze digitali", "scuola digitale", "cybersecurity gratis", "impara sicurezza informatica", "duolingo sicurezza", "gioco educativo", "cittadinanza digitale", "italia", "formazione phishing"],
  // Was "DeepSafe Team", which credits nobody. DeepSafe is Simone Mattioli's
  // project, and naming him here is what ties this property to his entity.
  authors: [{ name: "Simone Mattioli", url: "https://simo-hue.github.io/" }],
  creator: "Simone Mattioli",
  publisher: "DeepSafe",
  icons: {
    icon: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/landing/assets/new-logo.png`,
    apple: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/landing/assets/new-logo.png`,
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: SITE_URL,
    title: "DeepSafe - Il Tuo Coach di Vita Digitale",
    description: "Trasforma la sicurezza informatica in un gioco. Sfida i tuoi amici, scala la classifica e proteggi il tuo futuro digitale con lezioni da 5 minuti.",
    siteName: "DeepSafe",
    images: [
      {
        // INTERIM: /landing/assets/og-youth.jpg does not exist in this repo and
        // 404s on both deployed sites — the social preview has been broken for a
        // while. Pointing at the logo, which does resolve. The declared size is
        // the file's real size; do not restate 1200x630 until an actual
        // 1200x630 preview image is produced (tracked in TO_SIMO_DO.md).
        url: "/landing/assets/logo.png",
        width: 618,
        height: 646,
        alt: "DeepSafe — impara la sicurezza digitale giocando",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DeepSafe - Competenze Digitali per Tutti",
    description: "Impara a difenderti online giocando. Il modo più semplice per capire la cybersecurity.",
    images: ["/landing/assets/logo.png"],
  },
  manifest: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/manifest.json`,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DeepSafe",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "8qmREYvq02YN2lDjMscR2l6ysUa6ZfMPd3nHhzsA29k",
  },
};

/**
 * The one canonical Person node for Simone Mattioli, defined on his portfolio.
 * Every property he owns references this exact string so that crawlers and LLMs
 * resolve them all to a single entity instead of one thin node per site. It must
 * stay byte-identical everywhere — no trailing slash before the fragment.
 */
const CANONICAL_PERSON_ID = 'https://simo-hue.github.io/#person';

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#app`,
      "name": "DeepSafe",
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "Web, iOS, Android",
      "url": `${SITE_URL}/`,
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "EUR"
      },
      "description": "Piattaforma gamificata per l'apprendimento della sicurezza informatica e delle competenze digitali.",
      // NOTE: no `aggregateRating`. It previously declared 4.8 from 1250 ratings
      // with no reviews anywhere on the site. Google's review-snippet policy treats
      // unverifiable ratings as spam, and it is a documented cause of site-wide
      // structured-data manual actions. Only re-add from real, auditable data.
      "featureList": "Gamification, Corsi Cybersecurity, Quiz Interattivi, Leaderboard, Sfide Giornaliere",
      "inLanguage": "it-IT",
      "author": { "@id": CANONICAL_PERSON_ID },
      "publisher": { "@id": `${SITE_URL}/#organization` }
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      "name": "DeepSafe",
      "url": `${SITE_URL}/`,
      "description": "Startup di gamification per la sicurezza digitale, fondata da Simone Mattioli.",
      "founder": { "@id": CANONICAL_PERSON_ID },
      "sameAs": [
        "https://www.instagram.com/deepsafe_/",
        "https://www.youtube.com/@Deep-Safe",
        "https://www.tiktok.com/@deepsafe"
      ]
    },
    {
      // Reference only — the full Person is defined on the portfolio.
      "@type": "Person",
      "@id": CANONICAL_PERSON_ID,
      "name": "Simone Mattioli",
      "url": "https://simo-hue.github.io/"
    }
  ]
};


import { SystemUIProvider } from "@/context/SystemUIContext";
import { SoundProvider } from "@/context/SoundContext";

import { PostHogProvider } from "./providers";
import { MobileConfig } from "@/components/layout/MobileConfig";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // `lang` is "it": all content on this site is Italian, and og:locale is it_IT.
  return (
    <html lang="it" className="dark">
      <body
        className={`${inter.variable} ${orbitron.variable} antialiased bg-cyber-dark`}
      >
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-HJWJBEW0ZS"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-HJWJBEW0ZS');
          `}
        </Script>

        {/*
          Schema.org JSON-LD — a plain <script>, deliberately NOT next/script.
          `<Script>` renders this as a client component, so the markup only exists
          after JavaScript runs. GPTBot, ClaudeBot, CCBot and PerplexityBot do not
          execute JavaScript, which made this graph invisible to exactly the
          crawlers it is written for. A raw tag ships it in the static HTML.
        */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        <PostHogProvider>
          <SystemUIProvider>
            <SoundProvider>
              <LayoutWrapper>
                <MobileConfig />
                {children}
              </LayoutWrapper>
            </SoundProvider>
          </SystemUIProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
