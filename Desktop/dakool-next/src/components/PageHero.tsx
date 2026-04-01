type Props = {
  tag: string;
  title: string;
  highlight: string;
  subtitle: string;
};

export default function PageHero({ tag, title, highlight, subtitle }: Props) {
  return (
    <header className="relative pt-32 pb-20 overflow-hidden bg-[#080808] border-b border-white/10">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <span className="inline-block bg-[#00853F]/10 border border-[#00853F]/30 text-[#00853F] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full font-sans mb-6">
          {tag}
        </span>
        <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tight mb-4" style={{ fontFamily: "'Bebas Neue', cursive" }}>
          {title}{' '}
          <span className="bg-gradient-to-r from-[#00853F] to-[#FDEF42] bg-clip-text text-transparent">{highlight}</span>
        </h1>
        <p className="text-gray-400 font-sans text-lg max-w-xl mx-auto">{subtitle}</p>
      </div>
      {/* Flag bar */}
      <div className="absolute bottom-0 left-0 right-0 flex h-1">
        <span className="flex-1 bg-[#00853F]" />
        <span className="flex-1 bg-[#FDEF42]" />
        <span className="flex-1 bg-[#E31E24]" />
      </div>
    </header>
  );
}
