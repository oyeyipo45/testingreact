import { useContext } from 'react';
import { WidgetContext } from '../lib/context';
import {
  back_icon,
  close_icon,
  hamburger_icon,
  rotated_send_icon,
} from '../../assets';

interface IChat {
  setdisplayInView: (value: string) => void;
}

export function Chat(props: IChat) {
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
        <div className='widget-chat-header'>
          <div className='widget-nav'>
            <span className='widget-username'>A</span>
            <span className='online-text'>Online</span>
          </div>
          <div className='widget-nav'>
            <img
              src={back_icon}
              alt='back'
              onClick={() => setdisplayInView('home')}
            />
            <img src={hamburger_icon} alt='navigation' />
            <img
              onClick={() => setIsOpen(false)}
              src={close_icon}
              alt='navigation'
            />
          </div>
        </div>
        <div></div>
        <div className='separator-container'>
          <div className='separator' />
        </div>
      </div>

      <div className='footer'>
        <input />
        <div className='send-message'>
          <div className='send-message-icon'>
            <img src={rotated_send_icon} alt='send' />
          </div>
        </div>
      </div>
    </div>
  );
}
