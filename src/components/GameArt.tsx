import { Gamepad2 } from 'lucide-react';

/**
 * Original flat illustrations for each game (drawn as SVG, no emoji).
 * Every one sits on a 120x120 canvas and is designed to sit on the game's
 * gradient background. Add a new case here when you add a game.
 */
function Art({ slug }: { slug: string }) {
  switch (slug) {
    case 'hanzi-slash':
      return (
        <>
          {/* left half */}
          <g transform="translate(-7 2) rotate(-14 58 60)">
            <path d="M58 22 A38 38 0 0 0 58 98 Z" fill="#1f7a3a" />
            <path d="M58 26 A34 34 0 0 0 58 94 Z" fill="#d8f5cc" />
            <path d="M58 30 A30 30 0 0 0 58 90 Z" fill="#ff4d6d" />
            <ellipse cx="45" cy="47" rx="2.6" ry="4" fill="#3b1220" transform="rotate(-20 45 47)" />
            <ellipse cx="40" cy="62" rx="2.6" ry="4" fill="#3b1220" transform="rotate(-8 40 62)" />
            <ellipse cx="46" cy="77" rx="2.6" ry="4" fill="#3b1220" transform="rotate(14 46 77)" />
            <ellipse cx="50" cy="60" rx="2.4" ry="3.6" fill="#3b1220" />
          </g>
          {/* right half */}
          <g transform="translate(7 -2) rotate(14 64 60)">
            <path d="M64 22 A38 38 0 0 1 64 98 Z" fill="#1f7a3a" />
            <path d="M64 26 A34 34 0 0 1 64 94 Z" fill="#d8f5cc" />
            <path d="M64 30 A30 30 0 0 1 64 90 Z" fill="#ff4d6d" />
            <ellipse cx="77" cy="47" rx="2.6" ry="4" fill="#3b1220" transform="rotate(20 77 47)" />
            <ellipse cx="82" cy="62" rx="2.6" ry="4" fill="#3b1220" transform="rotate(8 82 62)" />
            <ellipse cx="76" cy="77" rx="2.6" ry="4" fill="#3b1220" transform="rotate(-14 76 77)" />
            <ellipse cx="72" cy="60" rx="2.4" ry="3.6" fill="#3b1220" />
          </g>
          {/* slash */}
          <path d="M16 106 L106 14" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" opacity=".95" />
          <path d="M22 108 L110 22" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity=".5" />
          {/* juice */}
          <circle cx="30" cy="30" r="3" fill="#ff8fa3" />
          <circle cx="92" cy="96" r="3.5" fill="#ff8fa3" />
          <circle cx="100" cy="40" r="2.2" fill="#ffd1d9" />
        </>
      );

    case 'word-pop':
      return (
        <>
          <circle cx="46" cy="70" r="32" fill="#fff" fillOpacity=".22" stroke="#fff" strokeOpacity=".85" strokeWidth="2.5" />
          <path d="M26 60 A22 22 0 0 1 40 46" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity=".85" />
          <text x="46" y="72" textAnchor="middle" dominantBaseline="central" fontSize="32" fontWeight="800" fill="#fff">
            汉
          </text>
          <circle cx="84" cy="42" r="23" fill="#fff" fillOpacity=".22" stroke="#fff" strokeOpacity=".85" strokeWidth="2.5" />
          <path d="M69 36 A15 15 0 0 1 79 28" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".85" />
          <text x="84" y="44" textAnchor="middle" dominantBaseline="central" fontSize="24" fontWeight="800" fill="#fff">
            字
          </text>
          <circle cx="92" cy="90" r="11" fill="#fff" fillOpacity=".2" stroke="#fff" strokeOpacity=".8" strokeWidth="2" />
          <circle cx="24" cy="28" r="7" fill="#fff" fillOpacity=".2" stroke="#fff" strokeOpacity=".8" strokeWidth="2" />
        </>
      );

    case 'hanzi-snake':
      return (
        <>
          <path
            d="M26 96 C26 66 62 78 62 54 C62 34 92 44 90 26"
            stroke="#0b3d2e"
            strokeWidth="20"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M26 96 C26 66 62 78 62 54 C62 34 92 44 90 26"
            stroke="#a7f3b0"
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M26 96 C26 66 62 78 62 54 C62 34 92 44 90 26"
            stroke="#34d399"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray="2 14"
            fill="none"
          />
          <circle cx="92" cy="22" r="13" fill="#a7f3b0" stroke="#0b3d2e" strokeWidth="3" />
          <circle cx="88" cy="19" r="3.4" fill="#fff" />
          <circle cx="97" cy="19" r="3.4" fill="#fff" />
          <circle cx="89" cy="19.5" r="1.6" fill="#0b3d2e" />
          <circle cx="98" cy="19.5" r="1.6" fill="#0b3d2e" />
          <path d="M93 34 L93 42 M93 42 L89 47 M93 42 L97 47" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* apple */}
          <circle cx="24" cy="30" r="12" fill="#ef4444" stroke="#7f1d1d" strokeWidth="2" />
          <path d="M24 18 C24 14 26 12 29 11" stroke="#7c4a1e" strokeWidth="2" strokeLinecap="round" fill="none" />
          <ellipse cx="31" cy="12" rx="5" ry="2.6" fill="#22c55e" transform="rotate(-25 31 12)" />
        </>
      );

    case 'pinyin-launcher':
      return (
        <>
          {/* slingshot */}
          <path d="M60 108 V78 M60 78 L40 46 M60 78 L80 46" stroke="#5a3515" strokeWidth="9" strokeLinecap="round" fill="none" />
          <path d="M60 108 V78 M60 78 L40 46 M60 78 L80 46" stroke="#a66a2c" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          <path d="M40 46 Q60 70 80 46" stroke="#1f2937" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          {/* bird */}
          <circle cx="60" cy="56" r="17" fill="#ef4444" stroke="#fff" strokeWidth="3" />
          <path d="M46 62 Q60 76 74 62 Q60 66 46 62Z" fill="#fca5a5" />
          <path d="M52 41 L56 35 L60 41 L64 34 L67 42" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="54" cy="52" r="4.6" fill="#fff" />
          <circle cx="66" cy="52" r="4.6" fill="#fff" />
          <circle cx="55" cy="53" r="2" fill="#111" />
          <circle cx="65" cy="53" r="2" fill="#111" />
          <path d="M48 46 L58 49 M72 46 L62 49" stroke="#111" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M55 58 L65 58 L60 66Z" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" strokeLinejoin="round" />
          {/* motion dashes */}
          <path d="M14 30 Q30 12 52 18" stroke="#fff" strokeOpacity=".7" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 8" fill="none" />
        </>
      );

    case 'star-defenders':
      return (
        <>
          <circle cx="22" cy="24" r="2.2" fill="#fff" />
          <circle cx="98" cy="32" r="2.8" fill="#fff" />
          <circle cx="90" cy="92" r="1.8" fill="#fff" />
          <circle cx="30" cy="86" r="2.4" fill="#fff" />
          {/* flame */}
          <path d="M50 84 Q60 120 70 84Z" fill="#fbbf24" />
          <path d="M54 84 Q60 108 66 84Z" fill="#fff7ae" />
          {/* fins */}
          <path d="M47 62 L30 90 L48 82Z" fill="#ef4444" />
          <path d="M73 62 L90 90 L72 82Z" fill="#ef4444" />
          {/* body */}
          <path d="M60 12 C79 28 81 62 73 84 H47 C39 62 41 28 60 12 Z" fill="#f8fafc" />
          <path d="M60 12 C67 18 71 26 73 34 H47 C49 26 53 18 60 12 Z" fill="#ef4444" />
          <circle cx="60" cy="55" r="10" fill="#bfdbfe" stroke="#1e3a8a" strokeWidth="3" />
          <path d="M55 51 A7 7 0 0 1 61 48" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        </>
      );

    default:
      return null;
  }
}

const KNOWN = ['hanzi-slash', 'word-pop', 'hanzi-snake', 'pinyin-launcher', 'star-defenders'];

export function GameArt({ slug, className = '' }: { slug: string; className?: string }) {
  if (!KNOWN.includes(slug)) {
    return <Gamepad2 aria-hidden className={className} strokeWidth={1.6} color="#fff" />;
  }
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={className} style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.25))' }}>
      <Art slug={slug} />
    </svg>
  );
}
