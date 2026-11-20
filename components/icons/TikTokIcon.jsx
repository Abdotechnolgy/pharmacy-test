// lucide-react مفيهوش أيقونة TikTok جاهزة، فده SVG بسيط مطابق لنفس أسلوب باقي
// أيقونات lucide (stroke-based، 24x24 viewBox) عشان يبان متسق مع Facebook/Instagram.
export default function TikTokIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M16.5 3c.3 2.1 1.7 3.6 4 3.9v2.6c-1.4 0-2.7-.4-3.9-1.2v6.4c0 3-2.3 5.3-5.3 5.3S6 17.7 6 14.7c0-2.9 2.2-5.2 5-5.3v2.7c-1.3.1-2.4 1.2-2.4 2.6 0 1.5 1.2 2.7 2.7 2.7s2.7-1.2 2.7-2.7V3h2.5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
