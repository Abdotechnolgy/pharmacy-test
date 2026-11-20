export default function Seal({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <circle cx="50" cy="50" r="47" stroke="#C9A24B" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="40" stroke="#0A4B42" strokeWidth="2.5" />
      <path
        d="M35 30 v40 M35 30 h10 a9 9 0 0 1 0 18 h-10 M40 48 l10 22"
        stroke="#0A4B42"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M48 35 c8 -10 24 -6 24 6 c0 10 -12 16 -24 26 c-4 -3.5 -7 -6.5 -9 -9"
        stroke="#1B6E63"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="66" cy="34" r="3.2" fill="#C9A24B" />
      <path d="M70 30 a5 5 0 1 0 4 8" stroke="#C9A24B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}
