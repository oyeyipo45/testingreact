import { useContext, useEffect, useRef, useState } from 'react';
import { WidgetContext } from '../lib/context';
import {
  black_send_icon,
  close_icon,
  hamburger_icon,
  rotated_send_icon,
  white_send_icon,
} from '../../assets';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faComment,
  faEnvelope,
  faHouse,
} from '@fortawesome/free-solid-svg-icons';

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
  const { isOpen, setIsOpen } = useContext(WidgetContext);

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
        <img src={rotated_send_icon} alt='open widget' />
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
                <span className='product-question-text '>
                  I have a question about a product
                </span>
                <div className='w-10 h-10'>
                  <img src={black_send_icon} alt='send message' />
                </div>
              </div>
              <div
                className='product-question'
                onClick={() => setdisplayInView('chat')}
              >
                <span className='product-question-text '>
                  What is the status of my order?
                </span>
                <div className='w-10 h-10'>
                  <img src={black_send_icon} alt='send message' />
                </div>
              </div>
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
              {/* <img src={home_icon} alt='home' className='footer-icon-image' /> */}
              <FontAwesomeIcon icon={faHouse} color={homeColor} fontSize={28} />
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
              {/* <img
                src={message_icon}
                alt='chat'
                className='footer-icon-image'
              /> */}
              <FontAwesomeIcon
                icon={faComment}
                color={chatColor}
                fontSize={28}
              />
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
              <FontAwesomeIcon
                icon={faEnvelope}
                color={emailColor}
                fontSize={28}
              />
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
