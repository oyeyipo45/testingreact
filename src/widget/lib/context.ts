import { createContext } from 'react';
import { IMessage } from '../components/chat';

interface WidgetContextType {
  isOpen: boolean;
  userEmail: string;
  setIsOpen: (isOpen: boolean) => void;
  setUserEmail: (data: string) => void;
  setConversation: (data: IMessage[]) => void;
  clientKey: string;
  conversation: IMessage[];
}

export const WidgetContext = createContext<WidgetContextType>({
  isOpen: false,
  setIsOpen: () => undefined,
  setUserEmail: () => undefined,
  setConversation: () => undefined,
  clientKey: '',
  userEmail: '',
  conversation: [
    {
      sender: '',
      content: '',
      id: 0,
    },
  ],
});
