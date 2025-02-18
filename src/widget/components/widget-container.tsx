import { useState, useEffect } from 'react';
import { WidgetContext } from '../lib/context';
import { Widget } from './widget';
import { Chat } from "./chat";

interface WidgetContainerProps {
  clientKey: string;
}

export function WidgetContainer({ clientKey }: WidgetContainerProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [displayInView, setdisplayInView] = useState('home');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <WidgetContext.Provider value={{ isOpen, setIsOpen, clientKey }}>
      {displayInView === 'home' && (
        <Widget setdisplayInView={setdisplayInView} />
      )}
      {displayInView === 'chat' && <Chat setdisplayInView={setdisplayInView} />}
    </WidgetContext.Provider>
  );
}