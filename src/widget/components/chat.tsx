import { useContext, useRef, useState } from 'react';
import { WidgetContext } from '../lib/context';
import {
  back_icon,
  close_icon,
  hamburger_icon,
  message_regular,
  rotated_send_icon,
} from '../../assets';

interface IChat {
  setdisplayInView: (value: string) => void;
}

interface IMessage {
  sender: string;
  content: string;
  id: number;
}

export function Chat(props: IChat) {
  const { setdisplayInView } = props;
  const { isOpen, setIsOpen } = useContext(WidgetContext);

  const [messages, setMessages] = useState<IMessage[]>([]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputText.trim() === '' || isLoading) return;

    // Add user message
    const userMessage = {
      id: Math.random(),
      content: inputText,
      sender: 'user',
    };

    setMessages((prev: IMessage[]) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const botMessage = {
        id: Math.random(),
        content: 'How are you doing today ?',
        sender: 'bot',
      };
      setMessages((prev: IMessage[]) => [...prev, botMessage]);
    }, 500);
  };

  if (!isOpen) {
    return (
      <button className='widget-button' onClick={() => setIsOpen(true)}>
        <img
          src={message_regular}
          alt='open widget'
          className='open-button-icon'
        />
      </button>
    );
  }

  return (
    <div className='widget-container'>
      <div className='widget-container-body'>
        <div className='widget-chat-header'>
          <div className='widget-nav'>
            <span className='widget-username'>A</span>
            <span className='online-text'>Online</span>
          </div>
          <div className='widget-nav'>
            <div
              className='nav-icon-container'
              onClick={() => setdisplayInView('home')}
            >
              <img src={back_icon} alt='back' />
            </div>

            <div className='nav-icon-container'>
              <img src={hamburger_icon} alt='navigation' />
            </div>

            <div className='nav-icon-container' 
                onClick={() => {
                  setIsOpen(false);
                  setdisplayInView('home');
                }}>
              <img
                src={close_icon}
                alt='navigation'
              />
            </div>
          </div>
        </div>
        <div className='messages-container'>
          {messages.map((message: IMessage) => (
            <div className='message' key={message.id}>
              {' '}
              {message.sender === 'user' && (
                <div className='user-message-container'>
                  <div className='user-message'> {message.content}</div>{' '}
                </div>
              )}
              {message.sender === 'bot' && (
                <div>
                  <div className='bot-message-container'>
                    <div className='bot-message'> {message.content}</div>{' '}
                  </div>{' '}
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className='loading-container'>
              <div className='loading-inner-container'>
                <div className='message-indicator'>
                  <div className='line'></div>
                  <div className='line'></div>
                  <div className='line'></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className='separator-container'>
          <div className='separator' />
        </div>
        <form onSubmit={handleSubmit}>
          <div className='footer'>
            <input
              className='message-input'
              type='text'
              placeholder='Type here..'
              value={inputText}
              disabled={isLoading}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button type='submit' className='send-message'>
              <div className='send-message-icon'>
                <img src={rotated_send_icon} alt='send' />
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
