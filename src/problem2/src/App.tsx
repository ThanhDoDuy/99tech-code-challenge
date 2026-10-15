import { useState } from 'react';
import type { SwapReceipt } from './types';
import { useTokens } from './hooks/useTokens';
import { WalletProvider } from './wallet/WalletContext';
import { Header } from './components/Header';
import { BottomNav, type Tab } from './components/BottomNav';
import { SwapTerminal } from './components/SwapTerminal';
import { ConfirmationScreen } from './components/ConfirmationScreen';
import { AssetsScreen } from './components/AssetsScreen';
import { HistoryScreen } from './components/HistoryScreen';

export default function App() {
  const { tokens, loading, error } = useTokens();
  const [tab, setTab] = useState<Tab>('swap');
  const [receipt, setReceipt] = useState<SwapReceipt | null>(null);

  return (
    <WalletProvider>
      <div className="min-h-screen flex flex-col bg-surface text-on-surface font-body-md text-body-md">
        <Header onOpenAssets={() => setTab('assets')} />

        <main className="flex-1 w-full pt-16 pb-24 px-margin">
          <div className="w-full max-w-[480px] mx-auto pt-4">
            {tab === 'swap' &&
              (receipt ? (
                <ConfirmationScreen
                  receipt={receipt}
                  onDone={() => setReceipt(null)}
                />
              ) : (
                <SwapTerminal
                  tokens={tokens}
                  loading={loading}
                  error={error}
                  onComplete={setReceipt}
                />
              ))}

            {tab === 'assets' && <AssetsScreen tokens={tokens} />}

            {tab === 'history' && <HistoryScreen tokens={tokens} />}
          </div>
        </main>

        <BottomNav
          active={tab}
          onChange={(t) => {
            setTab(t);
            if (t === 'swap') return;
          }}
        />
      </div>
    </WalletProvider>
  );
}
