import { useContext, useEffect, useState } from 'react';
import { WidgetContext } from '../lib/context';
import {
  back_icon,
  close_icon,
  green_message_icon,
  hamburger_icon,
  message_regular,
  person_icon,
  rotated_send_icon,
  white_send_icon,
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

  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsNameModalOpen(true);
  }, [firstName]);

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

  console.log(isNameModalOpen, 'isNameModalOpen');

  const toggleModal = () => {
    setIsNameModalOpen(!isNameModalOpen);
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

            <div
              className='nav-icon-container'
              onClick={() => {
                setIsOpen(false);
                setdisplayInView('home');
              }}
            >
              <img src={close_icon} alt='navigation' />
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
            <div className='message-input-container'>
              <input
                className='message-input'
                type='text'
                placeholder='Type here..'
                value={inputText}
                disabled={isLoading}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>
            <button type='submit' className='send-message'>
              <div className='send-message-icon'>
                <img src={rotated_send_icon} alt='send' />
              </div>
            </button>
          </div>
        </form>
      </div>

      {isNameModalOpen && (
        <div className='name-container'>
          <div className={`modal-overlay ${isNameModalOpen ? 'show' : ''}`}>
            <div className='modal-content'>
              <div>
                <div className='name-modal-header'>
                  {' '}
                  <span className='name-modal-header-text'>
                    Please introduce yourself:
                  </span>
                  <img
                    src={close_icon}
                    alt='close'
                    onClick={toggleModal}
                    className='close-name-modal'
                  />
                </div>
                <div className='modal-separator-container'>
                  <div className='modal-separator' />
                </div>
              </div>

              <div className='input-text-container'>
                <div className='name-input-container'>
                  <input
                    placeholder='Enter your name'
                    className='name-input-container-text'
                  />
                  <img src={person_icon} alt='name' />
                </div>

                <div className='name-input-container'>
                  <input
                    placeholder='Enter your email'
                    className='name-input-container-text'
                  />
                  <img src={green_message_icon} alt='email' />
                </div>
              </div>

              <div className='newsletter-container'>
                <input type='checkbox' />
                <span className='newsletter-signup-text'>
                  Sign up for our newsletter
                </span>
              </div>

              <div className='chat-with-us'>
                <span className='chat-question-text'>Chat with us</span>
                <img
                  src={white_send_icon}
                  alt='send message'
                  onClick={() => setdisplayInView('chat')}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
