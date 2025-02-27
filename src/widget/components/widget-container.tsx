import { useState, useEffect } from 'react';
import { WidgetContext } from '../lib/context';
import { Widget } from './widget';
import { Chat, IMessage } from './chat';
import { getDetails } from '../../utils';

interface WidgetContainerProps {
  clientKey: string;
}

export function WidgetContainer({ clientKey }: WidgetContainerProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [displayInView, setdisplayInView] = useState('home');
  const [userEmail, setUserEmail] = useState('');
  const [conversation, setConversation] = useState<IMessage[]>([]);
  const [userId, setUserId] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    setUserId(getDetails('userId') as string);
    setSessionId(getDetails('sessionId') as string);
  }, []);

 

  if (!mounted) {
    return null;
  }

  return (
    <WidgetContext.Provider
      value={{
        isOpen,
        setIsOpen,
        clientKey,
        userEmail,
        setUserEmail,
        conversation,
        setConversation,
        userId,
        sessionId,
      }}
    >
      {displayInView === 'home' && (
        <Widget setdisplayInView={setdisplayInView} />
      )}
      {displayInView === 'chat' && <Chat setdisplayInView={setdisplayInView} />}
    </WidgetContext.Provider>
  );
}
