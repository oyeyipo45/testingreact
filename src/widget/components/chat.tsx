import { useContext, useEffect, useRef, useState } from 'react';
import { WidgetContext } from '../lib/context';
import {
  back_icon,
  close_icon,
  green_message_icon,
  green_send_icon,
  hamburger_icon,
  message_regular,
  person_icon,
  rotated_send_icon,
  white_send_icon,
} from '../../assets';
import axios from 'axios';

interface IChat {
  setdisplayInView: (value: string) => void;
}

interface IMessage {
  sender: string;
  content: string;
  id: number;
}

interface IUser {
  email: string;
  name: string;
}

const BASE_URL = 'https://authenteak-backend.contextdata.dev';
export function Chat(props: IChat) {
  const { setdisplayInView } = props;
  const { isOpen, setIsOpen } = useContext(WidgetContext);

  const [messages, setMessages] = useState<IMessage[]>([]);

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [session_id, setSession_id] = useState('');

  const sendMessage = async (data: IUser) => {
    const { email, name } = data;

    try {
      //   const response = await fetch(`${BASE_URL}/users`, {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //       //   Authorization: `Bearer ${TOKEN}`,
      //     },
      //     body: JSON.stringify({ email, name }),
      //   });

      //   if (!response.ok) {
      //     throw new Error('API request failed');
      //   }

      //   const data = await response.json();

      const res = await axios({
        url: `${BASE_URL}/users`,
        data: { ...data },
        method: 'POST',
      });

      console.log(res.data, 'data');

      return res.data;
    } catch (error) {
      console.error('Error sending message:', error);
      return 'Sorry, there was an error processing your request.';
    }
  };

  useEffect(() => {
    setIsNameModalOpen(true);
  }, [name]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

    try {
      const response = await fetch(`${BASE_URL}/chats/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputText }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      console.log(data, 'data');

      return data; // Adjust based on your API response structure
    } catch (error) {
      console.error('Error sending message:', error);
      return 'Sorry, there was an error processing your request.';
    }

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

  const toggleModal = () => {
    setIsNameModalOpen(!isNameModalOpen);
  };

  const [isMoadalOpen, setModalIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setModalIsOpen(true);
  };

  const handleMouseLeave = () => {
    setModalIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setModalIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  interface IOptions {
    value: string;
    key: string;
  }

  const options = [
    {
      value: 'Turn off notification',
      key: 'notification',
    },
    { value: 'Rate your experience', key: 'experience' },
  ];
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

            <div
              className='dropdown'
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              ref={dropdownRef}
            >
              <div className='nav-icon-container'>
                <img src={hamburger_icon} alt='navigation' />
              </div>
              {isOpen && (
                <ul className='dropdown-menu'>
                  {options?.map((option: IOptions, index: number) => (
                    <li key={index} className='dropdown-item'>
                      <a className='dropdown-text'>{option?.value}</a>
                    </li>
                  ))}
                </ul>
              )}
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

        <div className='cover'>
          <div className='messages-container'>
            {messages.map((message: IMessage) => (
              <div className='message-inners' key={message.id}>
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
                    type='text'
                    placeholder='Enter your name'
                    className='name-input-container-text'
                    onChange={(e) => setName(e.target.value)}
                  />
                  <img src={person_icon} alt='name' />
                </div>

                <div className='name-input-container'>
                  <input
                    type='email'
                    placeholder='Enter your email'
                    className='name-input-container-text'
                    onChange={(e) => setEmail(e.target.value)}
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

              <div
                className='chat-with-us'
                onClick={() => sendMessage({ email, name })}
              >
                <span className='chat-question-text'>Chat with us</span>
                <img
                  src={white_send_icon}
                  alt='send message'
                  //   onClick={() => setdisplayInView('chat')}
                />
              </div>
              <div className='speak-with-agent'>
                <span className='agent-question-text'>Speak to an agent</span>
                <img
                  src={green_send_icon}
                  alt='send message'
                  //   onClick={() => setdisplayInView('chat')}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
