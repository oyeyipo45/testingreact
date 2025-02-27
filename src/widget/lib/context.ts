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
  userId: string;
  sessionId: string;
  isFetchingPreviousConversation: boolean;
  setIsFetchingPreviousConversation: (isOpen: boolean) => void;
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
      object: '',
      id: '',
      type: '',
    },
  ],
  userId: '',
  sessionId: '',
  isFetchingPreviousConversation: false,
  setIsFetchingPreviousConversation: () => undefined,
});
