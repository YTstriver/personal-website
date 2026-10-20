import { useSyncExternalStore } from 'react';

const phoneQuery = '(max-width: 600px)';
const readPhone = () => window.matchMedia(phoneQuery).matches;
const readServer = () => false;
const subscribe = (notify: () => void) => {
  const query = window.matchMedia(phoneQuery);
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
};

// Kept separate from the background's <=760px video choice: Pad layouts stay
// untouched when the phone-only presentation changes.
export function useStudioPhoneLayout() {
  return useSyncExternalStore(subscribe, readPhone, readServer);
}
