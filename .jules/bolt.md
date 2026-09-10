## 2024-06-10 - Zustand Store Subscription Bottleneck
**Learning:** Destructuring the entire state object from a Zustand store hook (e.g. `const { activeTier } = useSearchStore();`) subscribes the component to ALL state changes, completely negating any benefits of `React.memo` and causing O(N) re-renders in list components.
**Action:** Always use state selectors (e.g. `const activeTier = useSearchStore(state => state.activeTier);`) when consuming Zustand state, especially inside components rendered in lists, to ensure they only re-render when the specific state they depend on changes.
