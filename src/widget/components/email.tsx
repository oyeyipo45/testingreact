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
import { nanoid } from 'nanoid';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { BASE_URL, SetDetails } from '../../utils';

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

export function Email(props: IChat) {
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
  const [hideButton, setHideButton] = useState(false);

  const Avatar = getFirstCharacterOfFirstWord(initials);

  const [inputText, setInputText] = useState('');
  const [subjectText, setSubjectText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userDetailsError, setUserDetailsError] = useState(false);
  const [userDetailsErrorText, setUserDetailsErrorText] = useState('');

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  console.log(messages, 'messages');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputText.trim() === '' || subjectText.trim() === '') return;

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
    setUserDetailsError(false);
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
    (window as any).zE('messenger', 'show');
    (window as any).zE('messenger', 'open');
    // (window as any).zE('webWidget', 'prefill', {
    //   name: {
    //     value: name,
    //     readOnly: true,
    //   },
    //   email: {
    //     value: email,
    //     readOnly: true,
    //   },
    // });
    // (window as any).zE('webWidget', 'identify', {
    //   name: 'Akira Kogane',
    //   email: 'akira@voltron.com',
    // });
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
        <div className='widget-chat-header-email'>
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
        <form className='email-container' onSubmit={handleSubmit}>
          <div className='email-body'>
            <span className='online-text'>Subject</span>
            <div className='message-input-container'>
              <input
                className='message-input'
                type='text'
                placeholder='Subject'
                value={subjectText}
                onChange={(e) => setSubjectText(e.target.value)}
              />
            </div>
          </div>
          <div className='email-body'>
            <span className='online-text'>Body</span>
            <div className='message-input-container'>
              <textarea
                className='message-input-textarea'
                placeholder='Enter Body'
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>
          </div>
          <button
            type='submit'
            className='send-email-button'
            disabled={isFetchingPreviousConversation}
          >
            <div className='email-button-text'>Send Email</div>
          </button>
        </form>
      </div>
      {/* 
      <div>
        <span className='online-text'>Subject</span>
      </div> */}

      <div>
        {/* <div className='separator-container'>
          <div className='separator' />
        </div> */}
      </div>
    </div>
  );
}
