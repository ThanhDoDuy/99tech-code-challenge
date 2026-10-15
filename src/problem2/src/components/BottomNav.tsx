export type Tab = 'swap' | 'history' | 'assets';

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const ITEMS: { tab: Tab; label: string; icon: string }[] = [
  { tab: 'swap', label: 'Swap', icon: 'sync_alt' },
  { tab: 'history', label: 'History', icon: 'bar_chart' },
  { tab: 'assets', label: 'Assets', icon: 'account_balance_wallet' },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 w-full z-40 pb-safe bg-surface-container-lowest/85 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.3)]">
      <div className="h-16 px-space-md flex items-center justify-around max-w-[520px] mx-auto">
        {ITEMS.map((item) => {
          const isActive = item.tab === active;
          return (
            <button
              key={item.tab}
              type="button"
              onClick={() => onChange(item.tab)}
              className={`min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">
                {item.icon}
              </span>
              <span className="font-label-md text-label-md">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
