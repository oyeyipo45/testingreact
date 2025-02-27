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
import * as Yup from 'yup';
import DOMPurify from 'dompurify';
import { nanoid } from 'nanoid';
import {
  BASE_URL,
  getDetails,
  SetDetails,
  shortDescription,
} from '../../utils';
import MarkdownPreview from '@uiw/react-markdown-preview';

interface IChat {
  setdisplayInView: (value: string) => void;
}

export interface IMessage {
  sender: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  object: any;
  id: string;
  type: string;
}

interface IUser {
  email: string;
  name: string;
}

function getFirstCharacterOfFirstWord(sentence: string) {
  if (typeof sentence !== 'string' || sentence.length === 0) {
    return ''; // Handle empty or non-string input
  }

  const words = sentence.trim().split(/\s+/); // Split by whitespace, trim for leading/trailing spaces

  if (words.length === 0) {
    return ''; // Handle cases where the string contains only whitespace.
  }

  return words[0].charAt(0);
}

export function Chat(props: IChat) {
  const { setdisplayInView } = props;
  const {
    isOpen,
    setIsOpen,
    userEmail,
    setUserEmail,
    conversation,
    setConversation,
    userId,
    sessionId,
    isFetchingPreviousConversation,
  } = useContext(WidgetContext);

  console.log(userId, 'userId');

  const booleanUserId = Boolean(!userId);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const [errorUpdatingUser, seterrorUpdatingUser] = useState('');

  const [isUpdatingUserDetails, setisUpdatingUserDetails] =
    useState<boolean>(false);

  const [messages, setMessages] = useState<IMessage[]>([]);

  const [name, setName] = useState<string>('');
  const [initials, setInitials] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isNameModalOpen, setIsNameModalOpen] = useState(booleanUserId);
  const [userSessionId, setUserSessionId] = useState('');

  const Avatar = getFirstCharacterOfFirstWord(initials);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  console.log(messages, 'messages');

  const sendUserDetails = async (data: IUser) => {
    const { email, name } = data;

    setUserEmail(email.trim());
    setisUpdatingUserDetails(true);
    setInitials(name);
    const body = email ? { email, name } : {};
    try {
      const res = await axios.post(`${BASE_URL}/users`, { ...body });

      if (res) {
        setisUpdatingUserDetails(false);
      }

      const data = res.data?.data;

      const { user_id, session_id } = data;

      SetDetails('userId', user_id);
      SetDetails('sessionId', session_id);
      setUserSessionId(session_id);
      setIsNameModalOpen(false);

      return res.data;
    } catch (error) {
      setisUpdatingUserDetails(false);
      console.error('Error sending message:', error);
      return 'Sorry, there was an error processing your request.';
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputText.trim() === '' || isLoading) return;

    // Add user message
    const userMessage = {
      id: nanoid(),
      object: { text: inputText },
      sender: 'user',
      type: 'text',
    };

    setConversation((prev: IMessage[]) => [...prev, userMessage]);
    setMessages((prev: IMessage[]) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const req = await fetch(
        `${BASE_URL}/chats/messages?session=${sessionId || userSessionId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: inputText }),
        },
      );

      if (!req.ok) {
        throw new Error('API request failed');
      }

      const res = await req.json();

      const data = res.data;
      const { response } = data;

      console.log(response, 'response');

      const mappedResponse = response.map((singleMessage: any) => {
        return {
          id: nanoid(),
          object: singleMessage.object,
          sender: 'chatbot',
          type: singleMessage.type,
        };
      });

      setIsLoading(false);

      setMessages((prev: IMessage[]) => [...prev, ...mappedResponse]);
      setConversation((prev: IMessage[]) => [...prev, ...mappedResponse]);

      return data; // Adjust based on your API response structure
    } catch (error) {
      setIsLoading(false);
      console.error('Error sending message:', error);
      return 'Sorry, there was an error processing your request.';
    }

    // setTimeout(() => {
    //   setIsLoading(false);
    //   const botMessage = {
    //     id: nanoid(),
    //     content: apiResponse,
    //     sender: 'bot',
    //   };
    //   setMessages((prev: IMessage[]) => [...prev, botMessage]);
    // }, 500);
  };

  const toggleModal = async () => {
    setIsNameModalOpen(!isNameModalOpen);
    if (!email) {
      await sendUserDetails({ email, name });
    }
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

  interface IOptions {
    value: string;
    key: string;
  }

  function isValidEmail(email: string) {
    if (typeof email !== 'string') {
      return false; // Handle non-string input
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  const [emailError, setEmailError] = useState('');

  const schema = Yup.string().matches(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  );

  const handleEmailChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const enteredEmail = event.target.value;
    setEmail(enteredEmail.trim());
    try {
      await schema.validate(enteredEmail);
      setEmailError('');
    } catch (error) {
      const errorMessage =
        error instanceof Yup.ValidationError
          ? error.message
          : 'Invalid email address';
      setEmailError(errorMessage);
    }
  };

  const options = [
    {
      value: 'Turn off notification',
      key: 'notification',
    },
    { value: 'Rate your experience', key: 'experience' },
  ];

  const [isWidgetOpen, setIsWidgetOpen] = useState(false);

  // Function to open the widget
  const openWidget = () => {
    setIsOpen(false);
    if ((window as any).zE) {
      (window as any).zE('messenger', 'show');
      (window as any).zE('messenger', 'open');
    }

    // const widgetButton = document.getElementsByClassName('.widget-button');

    // widgetButton.style.display = 'none';
  };

  console.log(conversation, 'conversation');

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
          {/* {Avatar ? ( */}
          <div className='widget-nav'>
            {/* <span className='widget-username'>{Avatar}</span> */}
            <span className='widget-username'>A</span>
            <span className='online-text'>Online</span>
          </div>
          {/* ) : (
            <div></div>
          )} */}

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

        {isFetchingPreviousConversation && (
          <div className='conversation-loading'>
            <div className='conversation-loading-text'>
              <span>Loading previous conversation </span>
              <div className='loading-container'>
                <div className='message-indicator'>
                  <div className='line'></div>
                  <div className='line'></div>
                  <div className='line'></div>
                </div>
              </div>
            </div>
          </div>
        )}
        {conversation.length > 0 && (
          <div className='cover'>
            <div className='messages-container'>
              {conversation.map((message: IMessage) => (
                <div className='' key={message.id}>
                  {' '}
                  {message.sender === 'user' && (
                    <div className='user-message-container'>
                      <div className='user-message'> {message.object.text}</div>{' '}
                    </div>
                  )}
                  {message.sender === 'chatbot' && (
                    <div>
                      <div className='bot-spacing'>
                        {' '}
                        {message.type === 'text' && (
                          <>
                            <div className='bot-message-container'>
                              <div className='bot-message'>
                                {' '}
                                <MarkdownPreview
                                  style={{
                                    padding: '4px',
                                    margin: '0px',
                                    backgroundColor: '#F5F5F5',
                                    fontWeight: 400,
                                  }}
                                  source={message?.object?.text}
                                  wrapperElement={{
                                    'data-color-mode': 'light',
                                  }}
                                />
                              </div>{' '}
                            </div>
                          </>
                        )}
                        {message.type === 'products' && (
                          <div className='products-container'>
                            {message?.object?.products.length > 0 &&
                              message?.object?.products?.map((product: any) => (
                                <div className='product-body' key={product.id}>
                                  {' '}
                                  <div className='bot-message-container'>
                                    <a
                                      className='product-message'
                                      href={`https://authenteak.com/${product.url}`}
                                      target='_blank'
                                      rel='noreferrer'
                                    >
                                      <div className='product-details-container'>
                                        <div className='product-image-container'>
                                          <div className='product-image-parent'>
                                            <div>
                                              <img
                                                src={product.primary_image}
                                                alt='product'
                                                className='product-image'
                                              />
                                            </div>
                                          </div>
                                          <div className='product-things'>
                                            <div className='product-item'>
                                              <span className='truncate-overflo'>
                                                {product.name.substring(0, 50) +
                                                  '...'}
                                              </span>
                                            </div>
                                            <div className='product-item'>
                                              <span className='price-tex'>
                                                {product.price} USD
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        <div className='product-item'>
                                          <MarkdownPreview
                                            style={{
                                              padding: '4px',
                                              margin: '0px',
                                              backgroundColor: '#F5F5F5',
                                              fontWeight: 400,
                                              textAlign: 'justify',
                                            }}
                                            source={
                                              product.description.substring(
                                                0,
                                                150,
                                              ) + '...'
                                            }
                                            wrapperElement={{
                                              'data-color-mode': 'light',
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </a>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
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
        )}
      </div>

      <div>
        <div className='separator-container'>
          <div className='separator' />
        </div>
        <form onSubmit={handleSubmit}>
          <div className='footer-chat'>
            <div className='message-input-container'>
              <input
                className='message-input'
                type='text'
                placeholder='Type here..'
                value={inputText}
                disabled={isLoading || isFetchingPreviousConversation}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>
            <button
              type='submit'
              className='send-message'
              disabled={isFetchingPreviousConversation}
            >
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
                    disabled={isUpdatingUserDetails}
                    type='text'
                    placeholder='Enter your name'
                    className='name-input-container-text'
                    onChange={(e) => setName(e.target.value)}
                  />
                  <img src={person_icon} alt='name' />
                </div>

                <div
                  className={
                    emailError ? 'email-text-error' : `name-input-container`
                  }
                >
                  <input
                    disabled={isUpdatingUserDetails}
                    type='email'
                    placeholder='Enter your email'
                    className='name-input-container-text'
                    onChange={handleEmailChange}
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

              <button
                className={`chat-with-us`}
                disabled={isUpdatingUserDetails || !email}
                onClick={() => sendUserDetails({ email, name })}
              >
                <span className='chat-question-text'>Chat with us</span>
                {isUpdatingUserDetails ? (
                  <span className='loader'></span>
                ) : (
                  <img
                    src={white_send_icon}
                    alt='send message'
                    //   onClick={() => setdisplayInView('chat')}
                  />
                )}
              </button>
              <div className='speak-with-agent'>
                <span className='agent-question-text'>Speak to an agent</span>
                <img
                  src={green_send_icon}
                  alt='send message'
                  onClick={() => openWidget()}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
