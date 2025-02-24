import { createContext } from 'react';

interface WidgetContextType {
  isOpen: boolean;
  userEmail: string;
  setIsOpen: (isOpen: boolean) => void;
  setUserEmail: (data: string) => void;
  clientKey: string;
}

export const WidgetContext = createContext<WidgetContextType>({
  isOpen: false,
  setIsOpen: () => undefined,
  setUserEmail: () => undefined,
  clientKey: '',
  userEmail: '',
});
