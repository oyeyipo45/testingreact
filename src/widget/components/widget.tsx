import { useContext } from 'react';
import { WidgetContext } from '../lib/context';
import {
  black_send_icon,
  close_icon,
  hamburger_icon,
  home_icon,
  message_icon,
  white_send_icon,
} from '../../assets';

interface IWidget {
  setdisplayInView: (value: string) => void;
}
export function Widget(props: IWidget) {
  const { setdisplayInView } = props;
  const { isOpen, setIsOpen } = useContext(WidgetContext);

  if (!isOpen) {
    return (
      <button className='widget-button' onClick={() => setIsOpen(true)}>
        Open Widget
      </button>
    );
  }

  return (
    <div className='widget-container'>
      <div className='widget-container-body'>
        <div className='widget-header'>
          <div className='widget-nav'>
            <div className='nav-icon-container'>
              <img src={hamburger_icon} alt='navigation' />
            </div>
            <div className='nav-icon-container'>
              <img
                onClick={() => {
                  setIsOpen(false); setdisplayInView('home')
                }}
                src={close_icon}
                alt='navigation'
              />
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
              <div className='product-question'>
                <span className='product-question-text '>
                  I have a question about a product
                </span>
                <img
                  src={black_send_icon}
                  alt='send message'
                  onClick={() => setdisplayInView('chat')}
                />
              </div>
              <div className='product-question'>
                <span className='product-question-text '>
                  What is the status of my order?
                </span>
                <img
                  src={black_send_icon}
                  alt='send message'
                  onClick={() => setdisplayInView('chat')}
                />
              </div>
            </div>
            <div className='chat-with-us'>
              <span className='chat-question-text '>Chat with us</span>
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
          <div className='footer-icon'>
            <div>
              <img src={home_icon} alt='home' />
            </div>
            <span className='footer-text-home'>Chat</span>
          </div>
          <div className='footer-icon' onClick={() => setdisplayInView('chat')}>
            <div className='footer-icon-container'>
              <img src={message_icon} alt='chat' />
            </div>
            <span className='footer-text-chat'>Chat</span>
          </div>
        </div>
      </div>
    </div>
  );
}
