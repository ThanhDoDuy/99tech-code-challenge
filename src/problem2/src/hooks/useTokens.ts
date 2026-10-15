import { useEffect, useState } from 'react';
import type { Token } from '../types';
import { fetchTokens } from '../api/tokens';

interface TokensState {
  tokens: Token[];
  loading: boolean;
  error: string | null;
}

/** Loads the swappable token list once on mount. */
export function useTokens(): TokensState {
  const [state, setState] = useState<TokensState>({
    tokens: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;

    fetchTokens()
      .then((tokens) => {
        if (active) setState({ tokens, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (active) {
          setState({
            tokens: [],
            loading: false,
            error: err instanceof Error ? err.message : 'Failed to load tokens',
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
}
