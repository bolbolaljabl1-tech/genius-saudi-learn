const PlatformHeader = () => (
  <header className="w-full bg-royal-blue py-4 sm:py-5 px-3 text-center shadow-md mb-4">
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      <span className="text-2xl sm:text-3xl" aria-hidden="true">🌴</span>
      <h1 className="font-ruqaa text-xl sm:text-3xl font-bold brand-name tracking-wide leading-tight">
        منصة الطالب العبقري
      </h1>
      <span className="text-2xl sm:text-3xl" aria-hidden="true">🌴</span>
    </div>
    <p className="font-amiri text-xs sm:text-sm text-matte-gold/90 mt-1.5 font-bold">
      رحلتك نحو التميّز تبدأ هنا
    </p>
  </header>
);

export default PlatformHeader;
