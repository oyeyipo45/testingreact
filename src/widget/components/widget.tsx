import { useContext, useEffect, useRef, useState } from 'react';
import { WidgetContext } from '../lib/context';
import {
  black_send_icon,
  close_icon,
  green_arrow_right,
  hamburger_icon,
  message_regular,
  rotated_send_icon,
  white_send_icon,
} from '../../assets';
import { MdEmail } from 'react-icons/md';
import { TiHome } from 'react-icons/ti';
import { IoChatbubbleEllipsesSharp } from 'react-icons/io5';
import { BASE_URL } from '../../utils';

interface IWidget {
  setdisplayInView: (value: string) => void;
}

enum IHomeComponents {
  HOME = 'home',
  CHAT = 'chat',
  EMAIL = 'email',
}

export function Widget(props: IWidget) {
  const { setdisplayInView } = props;
  const {
    isOpen,
    setIsOpen,
    setConversation,
    userId,
    sessionId,
    isFetchingPreviousConversation,
    setIsFetchingPreviousConversation,
  } = useContext(WidgetContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<boolean | null>(false);

  const [activeTab, setActiveTab] = useState<IHomeComponents>(
    IHomeComponents.HOME,
  );
  const [currentHover, setCurrentHover] = useState<IHomeComponents>();

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

  useEffect(() => {
    if (userId && sessionId) {
      console.log(userId, 'userId');
      setIsFetchingPreviousConversation(true);
      const fetchData = async () => {
        setLoading(true); // Set loading to true before the request

        try {
          const response = await fetch(
            `${BASE_URL}/chats/messages?session=${sessionId}`,
          ); // Replace with your API endpoint

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const jsonData = await response.json();

          const messages = jsonData?.data?.messages;

          const mappedmessages = messages.map((message: any) => {
            const sender = message.sender === 'user' ? 'user' : 'chatbot';
            return {
              id: message.id,
              object: message.object,
              sender: sender,
              type: message.type,
            };
          });

          console.log(messages, 'messages');

          setConversation(mappedmessages);
          setIsFetchingPreviousConversation(false);
          setError(null); // Clear any previous errors on success
        } catch (err: any) {
          setIsFetchingPreviousConversation(false);
          setError(err);
          setConversation([]); // Clear data on error
        } finally {
          setIsFetchingPreviousConversation(false);
          setLoading(false); // Set loading to false whether success or error
        }
      };

      fetchData();
    }
  }, []);

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

  console.log(activeTab, 'activeTab');

  const chatColor =
    activeTab === IHomeComponents.CHAT || currentHover === IHomeComponents.CHAT
      ? '#4C7B98'
      : '#9E9E9E';

  const homeColor =
    activeTab === IHomeComponents.HOME || currentHover === IHomeComponents.HOME
      ? '#4C7B98'
      : '#9E9E9E';

  const emailColor =
    activeTab === IHomeComponents.EMAIL ||
    currentHover === IHomeComponents.EMAIL
      ? '#4C7B98'
      : '#9E9E9E';

  return (
    <div className='widget-container'>
      <div className='widget-container-body'>
        <div className='widget-header'>
          <div className='widget-nav'>
            <div className='header-component-position'>
              <div
                className='dropdown'
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleMouseEnter}
                ref={dropdownRef}
              >
                <div>
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
              </div>
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

        <div className='widget-content'>
          <div className='widget-content-upper-section'>
            <div className='widget-username'>A</div>
            <div className='widget-hello-message-container'>
              <div className='widget-hello-message'>Hello there 👋 </div>
            </div>
            <div className='widget-message-container'>
              <div className='widget-message-heading'>
                How can we help you ?
              </div>
              <div className='widget-message'>
                You can ask anything about product, orders, or your account.
              </div>
            </div>
          </div>
          <div className='widget-question-section'>
            <div className='widget-question-top'>
              <div
                className='product-question'
                onClick={() => setdisplayInView('chat')}
              >
                <span className='product-question-text'>
                  I have a question about a product
                </span>
                <div className='question-arrow-icon'>
                  <img src={green_arrow_right} alt='Question about product' />
                </div>
              </div>
              <div
                className='product-question'
                onClick={() => setdisplayInView('chat')}
              >
                <span className='product-question-text '>
                  What is the status of my order?
                </span>
                <div className='question-arrow-icon'>
                  <img src={green_arrow_right} alt='Question about order' />
                </div>
              </div>
            </div>
            <div>
              <button
                className='chat-with-us'
                onClick={() => setdisplayInView('chat')}
              >
                <span className='chat-question-text'>Chat with us</span>
                <img src={white_send_icon} alt='send message' />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className='separator-container'>
          <div className='separator' />
        </div>
        <div className='footer'>
          <div
            className='footer-icon'
            onMouseEnter={() => setCurrentHover(IHomeComponents.HOME)}
            onMouseLeave={() => setCurrentHover(activeTab)}
            onClick={() => setActiveTab(IHomeComponents.HOME)}
          >
            <div>
              {/* <FontAwesomeIcon icon={faHouse} color={homeColor} fontSize={28} />
               */}
              <TiHome color={homeColor} fontSize={28} />
            </div>
            <span className='footer-text-home' style={{ color: homeColor }}>
              Home
            </span>
          </div>
          <div
            className='footer-icon'
            onMouseEnter={() => setCurrentHover(IHomeComponents.CHAT)}
            onMouseLeave={() => setCurrentHover(activeTab)}
            onClick={() => {
              setdisplayInView('chat');
              setActiveTab(IHomeComponents.CHAT);
            }}
          >
            <div className=''>
              {/* <FontAwesomeIcon
                icon={faComment}
                color={chatColor}
                fontSize={28}
              /> */}
              <IoChatbubbleEllipsesSharp color={chatColor} fontSize={28} />
            </div>
            <span className='footer-text-home' style={{ color: chatColor }}>
              Chat
            </span>
          </div>
          <div
            className='footer-icon'
            onMouseEnter={() => setCurrentHover(IHomeComponents.EMAIL)}
            onMouseLeave={() => setCurrentHover(activeTab)}
            onClick={() => {
              setActiveTab(IHomeComponents.EMAIL);
            }}
          >
            <div className=''>
              {/* <FontAwesomeIcon
                icon={faEnvelope}
                color={emailColor}
                fontSize={28}
              /> */}
              <MdEmail color={emailColor} fontSize={28} />
            </div>
            <span className='footer-text-home' style={{ color: emailColor }}>
              Email
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
