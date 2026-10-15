interface HeaderProps {
  /** Open the Assets screen (triggered by the profile avatar). */
  onOpenAssets: () => void;
}

/** Top app bar with brand, network badge and a (mock) connected wallet. */
export function Header({ onOpenAssets }: HeaderProps) {
  return (
    <header className="fixed top-0 w-full z-40 pt-safe bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.25)]">
      <div className="h-16 px-margin flex items-center justify-between gap-space-sm max-w-[520px] mx-auto">
        <div className="flex items-center gap-space-sm shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-container to-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-on-primary text-[20px]">
              swap_horiz
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-md text-headline-md tracking-tight text-on-surface leading-none">
              99Tech
            </span>
            <span className="font-label-md text-label-md text-on-surface-variant font-medium">
              Swap Terminal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-space-sm shrink-0">
          <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high/80">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-label-mono text-label-mono text-on-surface font-medium">
              ETH
            </span>
          </div>
          <button
            type="button"
            className="min-h-[40px] px-3 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-bright active:scale-95 transition-all flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-label-md text-label-md font-semibold text-primary">
              0x84f...91a
            </span>
          </button>
          <button
            type="button"
            aria-label="Open assets"
            title="Your assets"
            onClick={onOpenAssets}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 hover:brightness-110 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-on-primary text-[18px]">
              person
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
