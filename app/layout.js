import "./globals.css";
import { CartProvider } from "../context/CartContext";
import ChromeWrapper from "../components/ChromeWrapper";
import SettingsLoader from "../components/SettingsLoader";
import { SITE } from "../data/site";

export const metadata = {
  metadataBase: new URL(SITE.baseUrl),
  title: {
    default: "صيدلية الدكتور سالم أحمد فؤاد | أبو المطامير - البحيرة",
    template: "%s | صيدلية الدكتور سالم أحمد فؤاد",
  },
  description:
    "صيدلية الدكتور سالم أحمد فؤاد بمدينة أبو المطامير، محافظة البحيرة — أدوية أصلية، مستحضرات تجميل فاخرة، ومكملات غذائية، مع خدمة صيدلانية على مدار ٢٤ ساعة وتوصيل سريع.",
  keywords: [
    "صيدلية أبو المطامير",
    "صيدلية البحيرة",
    "صيدلية الدكتور سالم أحمد فؤاد",
    "صيدلية 24 ساعة أبو المطامير",
    "توصيل أدوية أبو المطامير",
  ],
  authors: [{ name: "صيدلية الدكتور سالم أحمد فؤاد" }],
  openGraph: {
    title: "صيدلية الدكتور سالم أحمد فؤاد | أبو المطامير - البحيرة",
    description:
      "أدوية أصلية، مستحضرات تجميل، ومكملات غذائية بإشراف صيدلاني على مدار الساعة. شارع التوحيد والنور، بجوار برج الثورة، أبو المطامير.",
    locale: "ar_EG",
    type: "website",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

function StructuredData() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Pharmacy",
    name: SITE.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address,
      addressLocality: "أبو المطامير",
      addressRegion: "البحيرة",
      addressCountry: "EG",
    },
    telephone: SITE.phoneNumber,
    openingHours: "Mo-Su 00:00-23:59",
    url: SITE.baseUrl,
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased bg-ivory text-navy font-body">
        <StructuredData />
        <SettingsLoader />
        <CartProvider>
          <ChromeWrapper>{children}</ChromeWrapper>
        </CartProvider>
      </body>
    </html>
  );
}
