type Props = {
  tag: string;
  title: string;
  highlight: string;
  subtitle: string;
};

export default function PageHero({ tag, title, highlight, subtitle }: Props) {
  return (
    <header className="relative pt-36 pb-20 bg-black overflow-hidden border-b border-white/5">
      {/* Decorative */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 bottom-0 right-[20%] w-px bg-white/3" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/5" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-2 h-2 rounded-full bg-[#00853F] shrink-0" />
          <span className="text-[#00853F] text-[11px] font-bold uppercase tracking-[0.35em] font-sans">{tag}</span>
        </div>
        <h1
          className="font-black text-white uppercase leading-[0.9] mb-6"
          style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 'clamp(56px, 10vw, 120px)' }}
        >
          {title}{' '}
          <span className="text-[#00853F]">{highlight}</span>
        </h1>
        <p className="text-gray-500 font-sans text-base sm:text-lg max-w-lg leading-relaxed">{subtitle}</p>
      </div>

      {/* Flag bar */}
      <div className="absolute bottom-0 left-0 right-0 flex h-[3px]">
        <span className="flex-1 bg-[#00853F]" />
        <span className="flex-1 bg-[#FDEF42]" />
        <span className="flex-1 bg-[#E31E24]" />
      </div>
    </header>
  );
}
