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

interface IChat {
  setdisplayInView: (value: string) => void;
}

interface IMessage {
  sender: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
  id: number;
}

interface IUser {
  email: string;
  name: string;
}

const BASE_URL = 'https://authenteak-backend.contextdata.dev';

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
  const { isOpen, setIsOpen, userEmail, setUserEmail } =
    useContext(WidgetContext);

  console.log(userEmail, 'userEmail');

  const booleanEmail = Boolean(!userEmail);

  console.log(booleanEmail, ':booleanEmail');

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const [isUpdatingUserDetails, setisUpdatingUserDetails] =
    useState<boolean>(false);

  const [messages, setMessages] = useState<IMessage[]>([]);

  const [name, setName] = useState<string>('');
  const [initials, setInitials] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isNameModalOpen, setIsNameModalOpen] = useState(booleanEmail);

  console.log(isNameModalOpen, 'isNameModalOpen');

  const [userId, setUserId] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');

  const Avatar = getFirstCharacterOfFirstWord(initials);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

      console.log(user_id, session_id, 'user_id, session_id ');

      setSessionId(session_id);
      setUserId(user_id);
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
      id: Math.random(),
      content: inputText,
      sender: 'user',
    };

    setMessages((prev: IMessage[]) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const req = await fetch(
        `${BASE_URL}/chats/messages?session=${sessionId}`,
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

      const botMessage = {
        id: Math.random(),
        content: response,
        sender: 'bot',
      };
      setIsLoading(false);

      setMessages((prev: IMessage[]) => [...prev, botMessage]);

      return data; // Adjust based on your API response structure
    } catch (error) {
      setIsLoading(false);
      console.error('Error sending message:', error);
      return 'Sorry, there was an error processing your request.';
    }

    // setTimeout(() => {
    //   setIsLoading(false);
    //   const botMessage = {
    //     id: Math.random(),
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

  // TODO : REMOVE AXIOS

  const options = [
    {
      value: 'Turn off notification',
      key: 'notification',
    },
    { value: 'Rate your experience', key: 'experience' },
  ];

  console.log(messages, 'messages');

  const [isWidgetOpen, setIsWidgetOpen] = useState(false);

  // Initialize Zendesk Widget
  // useEffect(() => {
  //   // Add Zendesk Widget script
  //   const script = document.createElement('script');
  //   script.id = 'ze-snippet';
  //   script.src =
  //     'https://static.zdassets.com/ekr/snippet.js?key=YOUR_ZENDESK_KEY';
  //   script.async = true;
  //   document.body.appendChild(script);

  //   // Clean up on component unmount
  //   return () => {
  //     // Optional: Remove the script when component unmounts
  //     if (document.getElementById('ze-snippet')) {
  //       document.body.removeChild(document.getElementById('ze-snippet'));
  //     }
  //   };
  // }, []);

  // // Function to open the widget
  // const openWidget = () => {
  //   if (window.zE) {
  //     window.zE('widget', 'open');
  //     setIsWidgetOpen(true);
  //   }
  // };

  // // Function to close the widget
  // const closeWidget = () => {
  //   if (window.zE) {
  //     window.zE('widget', 'close');
  //     setIsWidgetOpen(false);
  //   }
  // };

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

        <div className='cover'>
          <div className='messages-container'>
            {messages.map((message: IMessage) => (
              <div className='' key={message.id}>
                {' '}
                {message.sender === 'user' && (
                  <div className='user-message-container'>
                    <div className='user-message'> {message.content}</div>{' '}
                  </div>
                )}
                {message.sender === 'bot' && (
                  <div>
                    {/* <div className='bot-message-container'>
                      <div className='bot-message'> {message.content}</div>{' '}
                    </div>{' '} */}
                    <div className='bot-spacing'>
                      {message?.content?.map((data: any, index: number) => (
                        <div className='message-inners' key={index}>
                          {' '}
                          {data.type === 'text' && (
                            <div className='bot-message-container'>
                              <div className='bot-message'>
                                {' '}
                                {data?.object?.text}
                              </div>{' '}
                            </div>
                          )}
                          {data.type === 'products' && (
                            <div className='products-container'>
                              {data?.object?.products.length > 0 &&
                                data?.object?.products?.map((product: any) => (
                                  <div
                                    className='product-body'
                                    key={product.id}
                                  >
                                    {' '}
                                    <div className='bot-message-container'>
                                      <div className='product-message'>
                                        {' '}
                                        <div className='product-details-container'>
                                          <span>{product.name}</span>
                                          <p
                                            className='truncate'
                                            dangerouslySetInnerHTML={{
                                              __html: DOMPurify.sanitize(
                                                product.description,
                                              ),
                                            }}
                                          />
                                          <span>{product.price}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      ))}
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

                <div
                  className={
                    emailError ? 'email-text-error' : `name-input-container`
                  }
                >
                  <input
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
                // onClick={() => sendUserDetails({ email, name })}
                // onClick={() => openWidget}
              >
                <span className='chat-question-text'>Chat with us</span>
                <img
                  src={white_send_icon}
                  alt='send message'
                  //   onClick={() => setdisplayInView('chat')}
                />
              </button>
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

// const apiResponse = [
//   {
//     type: 'text',
//     object: {
//       text: "Okay, I've gathered some details on chairs for you. Let me know if you have any specific preferences or features in mind!\n",
//     },
//   },
//   {
//     type: 'products',
//     object: {
//       products: [
//         {
//           id: 97,
//           name: 'Source Furniture Napa Stacking Aluminum Dining Side Chair - Set of 4',
//           description:
//             '<p>Our Napa Dining Side Chair is made using a 2mm thick aluminum powder-coated frame with the seat and back constructed out of Durawood. These chairs are available in Silver Frame/Gray Accents, Silver Frame/Teak Accents, Black Frame/Gray Accents, Black Frame/Teak Accents, Champagne Frame/Gray Accents, and Champagne Frame/Teak Accent. These stacking dining side chairs accommodate 10 chairs to a stack and require no assembly. Nylon plastic "feet" help protect both the chair and the floor from scratching. Sold in sets of 4. </p> <p><strong>Note: Please contact our Contract Sales Department 404-525-1995 or toll-free at 866-350-8325 during our customer service hours (Mon - Sat: 10a - 6p; Sun: noon - 5p EDT) for additional information about volume pricing.</strong></p>',
//           price: 1778.4,
//           available_colors: [
//             'Kessler Silver Frame with Gray Durawood',
//             'Kessler Silver Frame with Teak Durawood',
//             'Textured Black Frame with Gray Durawood',
//             'Textured Black Frame with Teak Durawood',
//             'Textured Champagne Frame with Gray Durawood',
//             'Textured Champagne Frame with Teak Durawood',
//           ],
//           assembly_required: 'No',
//           quick_shipping: 'No',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 96,
//           name: 'Source Furniture Napa Stacking Aluminum Dining Armchair - Set of 4',
//           description:
//             '<p>Our Napa Dining Armchair is made using a 2mm thick aluminum powder-coated frame with the seat, back and armrests constructed out of Durawood. These chairs are available in Silver Frame/Gray Accents, Silver Frame/Teak Accents, Black Frame/Gray Accents, Black Frame/Teak Accents, Champagne Frame/Gray Accents, and Champagne Frame/Teak Accent. These stacking dining chairs accommodate 10 chairs to a stack and require no assembly. Nylon plastic "feet" help protect both the chair and the floor from scratching. Sold in sets of 4. </p> <p><strong>Note: Please contact our Contract Sales Department 404-525-1995 or toll-free at 866-350-8325 during our customer service hours (Mon - Sat: 10a - 6p; Sun: noon - 5p EDT) for additional information about volume pricing.</strong></p>',
//           price: 1900,
//           available_colors: [
//             'Kessler Silver Frame with Gray Durawood',
//             'Kessler Silver Frame with Teak Durawood',
//             'Textured Black Frame with Gray Durawood',
//             'Textured Black Frame with Teak Durawood',
//             'Textured Champagne Frame with Gray Durawood',
//             'Textured Champagne Frame with Teak Durawood',
//           ],
//           assembly_required: 'No',
//           quick_shipping: 'No',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 95,
//           name: 'Source Furniture Napa Stacking Aluminum Bar Side Chair - Set of 4',
//           description:
//             '<p>Our Napa Bar Armless Chair is made using a 2mm thick aluminum powder-coated frame with the seat and back constructed out of Durawood. These chairs are available in Silver Frame/Gray Accents, Silver Frame/Teak Accents, Black Frame/Gray Accents, Black Frame/Teak Accents, Champagne Frame/Gray Accents, and Champagne Frame/Teak Accent. These stacking bar chairs accommodate 3 chairs to a stack and require no assembly. Nylon plastic "feet" help protect both the chair and the floor from scratching. Sold in sets of 4. </p> <p><strong>Note: Please contact our Contract Sales Department 404-525-1995 or toll-free at 866-350-8325 during our customer service hours (Mon - Sat: 10a - 6p; Sun: noon - 5p EDT) for additional information about volume pricing.</strong></p>',
//           price: 2371.2,
//           available_colors: [
//             'Kessler Silver Frame with Gray Durawood',
//             'Kessler Silver Frame with Teak Durawood',
//             'Textured Black Frame with Gray Durawood',
//             'Textured Black Frame with Teak Durawood',
//             'Textured Champagne Frame with Gray Durawood',
//             'Textured Champagne Frame with Teak Durawood',
//           ],
//           assembly_required: 'No',
//           quick_shipping: 'No',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 94,
//           name: 'Source Furniture Napa Stacking Aluminum Bar Armchair - Set of 4',
//           description:
//             '<p>Our Napa Bar Armchair is made using a 2mm thick aluminum powder-coated frame with the seat, back and armrests constructed out of Durawood. These chairs are available in Silver Frame/Gray Accents, Silver Frame/Teak Accents, Black Frame/Gray Accents, Black Frame/Teak Accents, Champagne Frame/Gray Accents, and Champagne Frame/Teak Accent. These stacking bar chairs accommodate 3 chairs to a stack and require no assembly. Nylon plastic "feet" help protect both the chair and the floor from scratching. Sold in sets of 4. </p> <p><strong>Note: Please contact our Contract Sales Department 404-525-1995 or toll-free at 866-350-8325 during our customer service hours (Mon - Sat: 10a - 6p; Sun: noon - 5p EDT) for additional information about volume pricing.</strong></p>',
//           price: 2492.8,
//           available_colors: [
//             'Kessler Silver Frame with Gray Durawood',
//             'Kessler Silver Frame with Teak Durawood',
//             'Textured Black Frame with Gray Durawood',
//             'Textured Black Frame with Teak Durawood',
//             'Textured Champagne Frame with Gray Durawood',
//             'Textured Champagne Frame with Teak Durawood',
//           ],
//           assembly_required: 'No',
//           quick_shipping: 'No',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 100,
//           name: 'Source Furniture Paris Stacking Woven Dining Side Chair - Set of 4',
//           description:
//             '<p>Our Paris Dining Side Chair is made using a 2mm thick aluminum powder-coated "dark bamboo" frame with a UV Resistant synthetic rattan seat and back in both dark bamboo with black and white Duraweave and light bamboo with chocolate Duraweave.&nbsp;These stacking chairs accommodate 10 chairs to a stack and require no assembly. Nylon plastic "feet" help protect both the chair and the floor from scratching. Sold in sets of 4. </p> <p><strong>Note: Please contact our Contract Sales Department 404-525-1995 or toll-free at 866-350-8325 during our customer service hours (Mon - Sat: 10a - 6p; Sun: noon - 5p EDT) for additional information about volume pricing.</strong></p>',
//           price: 1086.8,
//           available_colors: [
//             'Dark Bamboo Frame with Black and White Duraweave',
//             'Light Bamboo Frame with Cream and Chocolate Duraweave',
//             'Light Bamboo Frame with Grey and White Duraweave',
//           ],
//           assembly_required: 'No',
//           quick_shipping: 'No',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 99,
//           name: 'Source Furniture Paris Stacking Woven Dining Armchair - Set of 4',
//           description:
//             '<p>Our Paris Dining Armchair is made using a 2mm thick aluminum powder-coated "dark bamboo" frame with a UV Resistant synthetic rattan seat and back in a black &amp; white finish. These stacking chairs accommodate 10 chairs to a stack and require no assembly. Nylon plastic "feet" help protect both the chair and the floor from scratching. Sold in sets of 4. </p> <p><strong>Note: Please contact our Contract Sales Department 404-525-1995 or toll-free at 866-350-8325 during our customer service hours (Mon - Sat: 10a - 6p; Sun: noon - 5p EDT) for additional information about volume pricing.</strong></p>',
//           price: 1185.6,
//           available_colors: [
//             'Dark Bamboo Frame with Black and White Duraweave',
//             'Light Bamboo Frame with Cream and Chocolate Duraweave',
//             'Light Bamboo Frame with Grey and White Duraweave',
//           ],
//           assembly_required: 'No',
//           quick_shipping: 'No',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 269,
//           name: "Barlow Tyrie Safari Folding Teak Director's Chair",
//           description:
//             "<p>Perfect for just about any location, the Barlow Tyrie Safari Director's Chair brings a new design aesthetic to the traditional director's chair. This chair is constructed of durable, weather-resistant teak and has brass hinges and fittings. The Director's Chair is ruggedly constructed, but lightweight enough to fold up and carry with you. The fabric seat and back of the chair are available in Pepper, White Sand/Natural, and Forest Green.</p>",
//           price: 575.2,
//           available_colors: ['Forest Green', 'White Sand', 'Pepper'],
//           assembly_required: 'No',
//           quick_shipping: 'Yes',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 98,
//           name: 'Source Furniture Paris Stacking Woven Bar Side Chair - Set of 4',
//           description:
//             '<p>Our Paris Bar Armless Chair is made using a 2mm thick aluminum powder-coated "dark bamboo" frame with a UV Resistant synthetic rattan seat and back in both dark bamboo with black and white Duraweave and light bamboo with chocolate Duraweave. These stacking bar chairs accommodate 3 chairs to a stack and require no assembly. Nylon plastic "feet" help protect both the chair and the floor from scratching. Sold in sets of 4. </p> <p><strong>Note: Please contact our Contract Sales Department 404-525-1995 or toll-free at 866-350-8325 during our customer service hours (Mon - Sat: 10a - 6p; Sun: noon - 5p EDT) for additional information about volume pricing.</strong></p>',
//           price: 1463,
//           available_colors: [
//             'Dark Bamboo Frame with Black and White Duraweave',
//             'Light Bamboo Frame with Cream and Chocolate Duraweave',
//             'Light Bamboo Frame with Grey and White Duraweave',
//           ],
//           assembly_required: 'No',
//           quick_shipping: 'No',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 144,
//           name: 'Barlow Tyrie Bermuda Teak Dining Side Chair',
//           description:
//             '<p>The Barlow Tyrie Bermuda Dining Side Chair is perfect for the garden, balcony or terrace. The lightweight teak hardwood chairs are accented with curved sides and a countoured back. Complete your Bermuda collection with the Bermuda Circular Dining table.</p>',
//           price: 599.2,
//           available_colors: '',
//           assembly_required: 'No',
//           quick_shipping: 'Yes',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 78,
//           name: 'Source Furniture Fiji Stacking Woven Bar Side Chair - Set of 4',
//           description:
//             'Our Fiji Bar Armless Chair is made using a 2mm thick aluminum powder-coated frame with a UV Resistant HDPE all-weather wicker seat and back in an Espresso woven color. These stacking bar chairs accommodate 3 chairs to a stack and require no assembly. Nylon plastic "feet" help protect both the chair and the floor from scratching. Sold in sets of 4. <p></p> <p><strong>Note: Please contact our Contract Sales Department 404-525-1995 or toll-free at 866-350-8325 during our customer service hours (Mon - Sat: 10a - 6p; Sun: noon - 5p EDT) for additional information about volume pricing.</strong></p>',
//           price: 2204,
//           available_colors: '',
//           assembly_required: 'No',
//           quick_shipping: 'No',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 132,
//           name: 'Barlow Tyrie Aura Sling Club Chair',
//           description:
//             '<p>Perfect for the dinner table or for relaxing with a good book, the Barlow Tyrie Aura Sling Club Chair provides contemporary style to any setting. The durable powder-coated frame supports the comfortable PVC coated Polyester Textilene sling seat. The chair also has beautiful teak detailing on the arms.</p>',
//           price: 575.2,
//           available_colors: [
//             'Graphite frame with Charcoal sling',
//             'Graphite frame with Titanium sling',
//             'Graphite frame with Platinum sling',
//             'Arctic White frame with Pearl sling',
//             'Champagne frame with Titanium sling',
//           ],
//           assembly_required: 'No',
//           quick_shipping: 'Yes',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 117,
//           name: 'Barlow Tyrie Ascot Folding Teak Dining Side Chair',
//           description:
//             '<p>Dine in comfort with the gently curved seat and back of the Barlow Tyrie Ascot Folding Side Chair. The chair is constructed of extremely-well made, plantation-grown teak that is triple-sanded for smoothness. Convenient folding chairs are a perfect solution for those with limited space or who entertain frequently and want to expand their space with additional seating. </p>',
//           price: 772,
//           available_colors: '',
//           assembly_required: 'No',
//           quick_shipping: 'Yes',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 115,
//           name: 'Barlow Tyrie Ascot Folding Teak Dining Armchair',
//           description:
//             '<p>Enjoy the comfort of the gently curved seat and back on the Barlow Tyrie Ascot Folding Armchair. The plantation-grown teak is durable and weather-resistant. A solid brass locking mechanism keeps the chair safely secure and then it can be folded up and stored away when not in use. This is especially convenient for entertaining or in tight quarters where you sometimes need additional seating...like a yacht! An optional seat cushion is available in more than 20 Sunbrella acrylic fabrics.</p>',
//           price: 924,
//           available_colors: '',
//           assembly_required: 'No',
//           quick_shipping: 'Yes',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 119,
//           name: 'Barlow Tyrie Ascot Highback Reclining Teak Armchair',
//           description:
//             '<p>Relax, dine, and recline in the Barlow Tyrie Ascot Highback Reclining Armchair. This high back teak chair reclines in four positions making it suitable as a dining chair and as a comfortable recliner in a casual setting. A matching footrest and side table are available as optional purchases. Also optional is an all-weather seat cushion that is available in more than 20 solution-dyed acrylic fabrics by Sunbrella.</p>',
//           price: 1328,
//           available_colors: '',
//           assembly_required: 'No',
//           quick_shipping: 'Yes',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 250,
//           name: 'Barlow Tyrie Monaco Teak Dining Side Chair',
//           description:
//             '<p>The Barlow Tyrie Monaco Dining Side Chair provides needed additional seating for any dining grouping. This heirloom quality side chair is painstakingly crafted of durable weather-resistant teak with mortise and tenon joints. The solid teak construction works beautifully in outdoor conditions and will age to a silvery patina. Relax in a chair that is made more comfortable by the gently contoured slats on the seat and back. An optional all-weather cushion is available in more than 160 solution-dyed acrylic fabrics by Sunbrella.</p>',
//           price: 871.2,
//           available_colors: '',
//           assembly_required: 'No',
//           quick_shipping: 'Yes',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 248,
//           name: 'Barlow Tyrie Monaco Teak Dining Armchair',
//           description:
//             "<p>The Barlow Tyrie Monaco Dining Armchair is Barlow Tyrie's #1 selling dining chair, and for good reason. This heirloom quality chair is expertly crafted of plantation-grown teak with mortise and tenon joints. The solid teak construction is durable and rugged enough to weather outdoor conditions. The gently contoured slats on the seat and back make a supremely comfortable chair. An optional all-weather cushion is available in more than 160 Sunbrella acrylic fabrics.</p>",
//           price: 999.2,
//           available_colors: '',
//           assembly_required: 'No',
//           quick_shipping: 'Yes',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 447,
//           name: 'Gloster Archi Teak Dining Armchair',
//           description:
//             '<p>Modern styling and a minimalist aesthetic are the hallmarks of the Archi dining chair from Gloster. This mixed-media dining chair in teak and all-weather rope is a great choice for a unique and stylish dining experience. Familiar mid-century lines will appeal to the design conscious, while the durability of teak and quality of Gloster workmanship will ensure this chair endures to become an heirloom piece in your collection.</p> <p><strong>Note:</strong> All Gloster furniture is factory tested to support a weight of 300 lbs.</p>',
//           price: 1702.8,
//           available_colors: '',
//           assembly_required: 'No',
//           quick_shipping: 'No',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 145,
//           name: 'Barlow Tyrie Bermuda Teak Bar Side Chair',
//           description:
//             '<p>Enjoy the strength and durability of solid teak construction with the Barlow Tyrie Bermuda High Dining Side Chair. The gently arched back provides comfort and adds a softer profile to this solidly built chair. The fresh style and clean lines will bring a modern aesthetic to your outdoor dining setting.</p>',
//           price: 719.2,
//           available_colors: '',
//           assembly_required: 'Yes',
//           quick_shipping: 'Yes',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 155,
//           name: 'Barlow Tyrie Chesapeake Teak Dining Side Chair',
//           description:
//             '<p>Bring the beautiful richness of solid hardwood teak and the elegant lines of the Barlow Tyrie Chesapeake Dining Side Chair to your outdoor dining space. The graceful curve of the slatted back brings a level of comfort that will help you relax and enjoy your dining experience. An optional sculpted cushion made of weather-resistant Sunbrella fabric completes the look. The quality of Barlow Tyrie teak furniture is second to none! Also available as a dining armchair.</p>',
//           price: 599.2,
//           available_colors: '',
//           assembly_required: 'Yes',
//           quick_shipping: 'Yes',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 77,
//           name: 'Source Furniture Fiji Stacking Woven Bar Armchair - Set of 4',
//           description:
//             '<p>Our Fiji Bar Armchair is made using a 2mm thick aluminum powder-coated frame with a UV Resistant HDPE all-weather wicker seat and back in an Espresso woven color. These stacking bar chairs accommodate 3 chairs to a stack and require no assembly. Nylon plastic "feet" help protect both the chair and the floor from scratching. Sold in sets of 4. </p> <p><strong>Note: Please contact our Contract Sales Department 404-525-1995 or toll-free at 866-350-8325 during our customer service hours (Mon - Sat: 10a - 6p; Sun: noon - 5p EDT) for additional information about volume pricing.</strong></p>',
//           price: 2280,
//           available_colors: '',
//           assembly_required: 'No',
//           quick_shipping: 'No',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 239,
//           name: 'Barlow Tyrie Mission Reclining Teak Lounge Chair',
//           description:
//             "<p>Relax in comfort and traditional style with the Barlow Tyrie Mission Reclining Armchair. Traditional Mission elements such as vertical slats and wide arms create a pleasing profile that will stand the test of time. The naturally weather-resistant teak makes the chair perfect for indoor or outdoor use and will age to a silvery patina when exposed to the elements. Plush all-weather seat and back cushions are available in more than 160 Sunbrella acrylic fabrics.</p> <p>Barlow Tyrie's furniture covers and storage bags are made using WeatherMAX-LTTM, a modified high UV resistant polyester fabric offering superior strength and durability with long-term color retention. This fabric is the industry's most balanced and cost-effective fabric available for outdoor applications requiring higher water repellence and excellent breathability. The perfect choice for outdoor furniture covers and storage bags where lightweight and ease of storage offer an advantage.</p><p> A unique fastening ensures a secure fit. These covers are easy to put on, remove and can be stored in their own pouch when not required.</p>",
//           price: 1670.4,
//           available_colors: '',
//           assembly_required: 'No',
//           quick_shipping: 'Yes',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 237,
//           name: 'Barlow Tyrie Mercury Stacking Stainless Steel Dining Armchair',
//           description:
//             '<p>Create a sophisticated, contemporary outdoor dining grouping with the Barlow Tyrie Mercury Sling Dining Armchair. The Mercury Collection has a variety of dining table shapes, sizes, and tabletop finishes. The marine grade stainless steel frame has teak or graphite armrest accents and supports the all-weather sling seating. The chairs are available in Charcoal sling with Graphite armrest, Platinum sling with Graphite armrest, Titanium sling with Graphite armrest, Pearl sling with White armrest, Pearl sling with Teak armrest, Platinum sling with Teak armrest, Titanium sling with Teak armrest, and Charcoal sling with Teak armrest.</p>',
//           price: 583.2,
//           available_colors: [
//             'Graphite armrest with Charcoal sling',
//             'Graphite armrest with Titanium sling',
//             'Graphite armrest with Platinum sling',
//             'White armrest with Pearl sling',
//             'Teak armrest with Charcoal sling',
//             'Teak armrest with Titanium sling',
//             'Teak armrest with Platinum sling',
//             'Teak armrest with Pearl sling',
//           ],
//           assembly_required: 'No',
//           quick_shipping: 'Yes',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 190,
//           name: 'Barlow Tyrie Equinox Stacking Teak Dining Side Chair',
//           description:
//             '<p>The Barlow Tyrie Equinox Stacking Teak Side Chair delivers beautiful, contemporary style with the convenience of a chair that can be stacked and stored away. This chair is great to have on hand when entertaining a crowd. The warm plantation-grown teak offers a nice contrast to the sleek, marine-grade stainless steel frame. Both materials offer weather-resistant durability to create a chair that will last. For a similar chair with arms, you may prefer the Equinox Stacking Teak Armchair.</p>',
//           price: 759.2,
//           available_colors: '',
//           assembly_required: 'No',
//           quick_shipping: 'No',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 193,
//           name: 'Barlow Tyrie Felsted Armchair',
//           description:
//             '<p>The Barlow Tyrie Felsted Armchair provides classic styling in durable plantation-grown teak. It makes a great companion piece to the benches in the Felsted Collection. The traditional Felsted Collection also has coordinating 58" garden bench. The straight-back slatted design is great in the garden or as part of a dining ensemble. An optional weather-resistant cushion is available in more than 25 solution-dyed fabrics by Sunbrella.</p>',
//           price: 911.2,
//           available_colors: '',
//           assembly_required: 'Yes',
//           quick_shipping: 'Yes',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 188,
//           name: 'Barlow Tyrie Equinox Stacking Sling Dining Side Chair - Raw Stainless Steel',
//           description:
//             '<p>The clean lines and understated style of the Barlow Tyrie Equinox Stacking Sling Side Chair makes it fit into any setting. The comfortable sling seat gets support from the strong marine-grade stainless steel frame. Both are easy to clean and weather-resistant, making these chairs a great choice for outside entertaining. The UV resistant Textilene sling is available in Charcoal, Platinum, Titanium and Pearl.</p>',
//           price: 591.2,
//           available_colors: '',
//           assembly_required: 'No',
//           quick_shipping: 'Yes',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 258,
//           name: 'Barlow Tyrie Monterey Rope Dining Armchair',
//           description:
//             '<p>This elegant armchair is built using quality materials and refined traditional construction methods; sculptured using a solid teak frame with a brown or elegant chalk cord for seat and back, combined to give a timeless appearance.</p>',
//           price: 999.2,
//           available_colors: '',
//           assembly_required: 'Yes',
//           quick_shipping: 'Yes',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 181,
//           name: 'Barlow Tyrie Equinox Stacking Sling Counter Side Chair - Raw Stainless Steel',
//           description:
//             '<p>The clean lines and understated style of the Barlow Tyrie Equinox Stacking Counter Side Chair makes it fit into any setting. The comfortable sling seat gets support from the strong marine-grade stainless steel frame. Both are easy to clean and weather-resistant, making these chairs a great choice for outside entertaining. The UV resistant Textilene sling is available in Charcoal, Platinum, Titanium and Pearl. Stacks to a max of 6 chairs.</p>',
//           price: 615.2,
//           available_colors: '',
//           assembly_required: 'No',
//           quick_shipping: 'Yes',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 354,
//           name: 'Classic Cushions Captain Dining Chair Cushion with Back',
//           description:
//             '<p>The Classic Cushions Captain Dining Chair Cushion with Back is a two-piece cushion and includes fabric tie-downs. The cover is 100% solution dyed acrylic fabric from Sunbrella and is available in 54 color selections. The seat cushion measures 20" x 18" deep and the back cushion is 20" wide and 18" deep. <strong>All of our Classic Cushions are custom made-to-order and all sales are final.</span></strong></p> <p>For the complete selection of outdoor replacement cushions and fabrics offered by Classic Cushions please download the <strong><a href="https://authenteak-api.s3.amazonaws.com/PDF/ClassicCushionsPDFs/Classic-Cushions-Catalog_2021.pdf" target="_blank">Classic Cushions Catalog</a></strong> and please review the <strong><a href="https://authenteak-api.s3.amazonaws.com/PDF/ClassicCushionsPDFs/Classic%20Cushions%20Warranty.pdf" target="_blank">Classic Cushions Warranty</a></strong>.</p>',
//           price: 98.1,
//           available_colors: [
//             'Canvas Twilight',
//             'Canvas Flint',
//             'Canvas Seasalt',
//             'Canvas Raffia',
//             'Mason Forest Green',
//             'Canvas Black',
//             'Canvas Pacific Blue',
//             'Canvas Forest Green',
//             'Canvas Navy',
//             'Canvas Antique Beige',
//             'Cast Ash',
//             'Cast Mist',
//             'Cast Oasis',
//             'Cast Shale',
//             'Cast Silver',
//             'Cast Slate',
//             'Cast Lagoon',
//             'Cast Charcoal',
//             'Spectrum Eggshell',
//             'Spectrum Sand',
//             'Spectrum Cilantro',
//             'Spectrum Daffodil',
//             'Spectrum Cayenne',
//             'Spectrum Graphite',
//             'Spectrum Mushroom',
//             'Spectrum Dove',
//             'Spectrum Indigo',
//             'Spectrum Peacock',
//             'Spectrum Caribou',
//             'Spectrum Carbon',
//             'Spectrum Denim',
//             'Cast Horizon',
//             'Cast Teak',
//             'Spectrum Cherry',
//             'Cast Ocean',
//             'Cast Pumice',
//             'Bliss linen',
//             'Bliss Sand',
//             'Bliss Smoke',
//             'Bliss Breeze',
//             'Canvas Wheat',
//             'Canvas Macaw',
//             'Canvas Teal',
//             'Canvas Vellum',
//             'Canvas True Blue',
//             'Foster Metallic',
//             'Gavin Mist',
//             'Dorsett Cherry',
//             'Brannon Whisper',
//             'Canvas White',
//             'Canvas Henna',
//             'Canvas Haze',
//             'Canvas Tamale',
//             'Canvas Skyline',
//             'Canvas Air Blue',
//             'Canvas Sapphire Blue',
//             'Linen Sesame',
//             'Canvas Fern',
//             'Canvas Teak',
//             'Canvas Sunflower Yellow',
//             'Canvas Heather Beige',
//             'Linen Stone',
//             'Canvas Tangerine',
//             'Brannon Redwood',
//             'Canvas Spa',
//             'Canvas Cocoa',
//             'Canvas Tuscan',
//             'Canvas Melon',
//             'Canvas Aruba',
//             'Canvas Jockey Red',
//             'Canvas Capri',
//             'Dolce Oasis',
//             'Canvas Ginkgo',
//             'Canvas Rust',
//             'Linen Natural',
//             'Linen Canvas',
//             'Canvas Buttercup',
//             'Canvas Canvas',
//             'Linen Silver',
//             'Canvas Logo Red',
//             'Canvas Burgundy',
//             'Cast Ivy',
//             'Canvas Granite',
//             'Canvas Charcoal',
//             'Canvas Brick',
//             'Canvas Mineral Blue',
//             'Canvas Sky Blue',
//             'Canvas Terracotta',
//             'Canvas Taupe',
//             'Canvas Hot Pink',
//             'Canvas Raven Black',
//             'Canvas Birds Eye',
//             'Canvas Coal',
//             'Canvas Flax',
//             'Canvas Regatta',
//             'Milano Char',
//             'Canvas Cyan',
//             'Canvas Cloud',
//             'Canvas Persimmon',
//             'Canvas Java',
//             'Cabana Regatta',
//             'Cove Pebble',
//             'Gateway Mist',
//             'Rain Linen Champagne',
//             'Rain Linen Sesame',
//             'Rain Dupione Sand',
//             'Rain Canvas Henna',
//             'Rain Canvas Black',
//             'Rain Canvas Ginkgo',
//             'Rain Canvas Navy',
//             'Rain Canvas Natural',
//             'Rain Brannon Redwood',
//             'Rain Sailcloth Sahara',
//             'Rain Sailcloth Salt',
//             'Rain Canvas Teak',
//             'Rain Canvas Cocoa',
//             'Rain Dupione Celeste',
//             'Rain Spectrum Cayenne',
//             'Rain Spectrum Dove',
//             'Rain Spectrum Mushroom',
//             'Rain Canvas Jockey Red',
//             'Rain Spectrum Indigo',
//             'Rain Cast Shale',
//             'Rain Cast Lagoon',
//             'Rain Spectrum Cilantro',
//             'Rain Canvas Pacific Blue',
//             'Rain Canvas Granite',
//             'Rain Canvas Charcoal',
//             'Rain Canvas Brick',
//             'Rain Canvas Air Blue',
//             'Rain Canvas Spa',
//             'Rain Canvas Teal',
//             'Rain Canvas Fern',
//             'Rain Canvas Coal',
//             'Rain Canvas Taupe',
//             'Rain Canvas Heather Beige',
//             'Rain Canvas Antique Beige',
//             'Rain Canvas Canvas',
//             'Dupione Sand',
//             'Dupione Papaya',
//             'Echo Ash',
//             'Echo Dune',
//             'Token Surfside',
//             'Dupione Celeste',
//             'Sailcloth Sahara',
//             'Sailcloth Salt',
//             'Mainstreet Latte',
//             'Hybrid Smoke',
//             'Luxe Indigo',
//             'Violetta Baltic',
//             'Fretwork Mist',
//             'Fretwork Flax',
//             'Fretwork Pewter',
//           ],
//           assembly_required: 'No',
//           quick_shipping: 'No',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 141,
//           name: 'Barlow Tyrie Aura Stacking Sling Dining Armchair',
//           description:
//             '<p>The Barlow Tyrie Aura Stacking Sling Armchair - Teak Armrest offers the same style and comfort of the Aura Deep Seating Armchair with the added convenience of a stacking chair. The lightweight Aura chair with stylish teak armrests is available in five color combinations - Graphite frame with Charcoal sling, Graphite frame with Titanium sling, Graphite frame with Platinum sling, Champagne frame with Titanium sling, and Artic White frame with Pearl sling.</p>',
//           price: 527.2,
//           available_colors: [
//             'Graphite Frame with Charcoal Sling',
//             'Graphite Frame with Titanium Sling',
//             'Graphite Frame with Platinum Sling',
//             'Artic White Frame with Pearl Sling',
//             'Champagne Frame with Titanium Sling',
//           ],
//           assembly_required: 'No',
//           quick_shipping: 'Yes',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 131,
//           name: 'Barlow Tyrie Aura Sling Counter Armchair',
//           description:
//             '<p>Built for the way you live, the Barlow Tyrie Aura Counter High Dining Carver Chair delivers style and comfort in a low maintenance package. The powder-coated finish protects the frame and an additional protective cover on the foot bar helps prevent undue wear. The chair is offered in five color combinations - Graphite frame with Charcoal sling, Champagne frame with Titanium sling, and Artic White frame with Pearl sling. The Aura 55-inch rectangular counter table is the perfect complement to the Aura counter chair.</p>',
//           price: 719.2,
//           available_colors: [
//             'Graphite frame with Charcoal sling',
//             'Graphite frame with Titanium sling',
//             'Graphite frame with Platinum sling',
//             'Arctic White frame with Pearl sling',
//             'Champagne frame with Titanium sling',
//           ],
//           assembly_required: 'No',
//           quick_shipping: 'Yes',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 134,
//           name: 'Barlow Tyrie Aura Sling Bar Armchair',
//           description:
//             '<p>Built for the way you live, the Barlow Tyrie Aura High Dining Carver Chair delivers style and comfort in a low maintenance package. The powder-coated finish protects the frame and an additional protective cover on the foot bar helps prevent undue wear. The chair is offered in five color combinations - Graphite frame with Charcoal sling, Graphite frame with Titanium sling, Graphite frame with Platinum sling, Champagne frame with Titanium sling, and Artic White frame with Pearl sling. The Aura 55-inch rectangular bar table is the perfect complement to the Aura bar chair.</p>',
//           price: 772,
//           available_colors: [
//             'Graphite frame with Charcoal sling',
//             'Graphite frame with Titanium sling',
//             'Graphite frame with Platinum sling',
//             'Arctic White frame with Pearl sling',
//             'Champagne frame with Titanium sling',
//           ],
//           assembly_required: 'Yes',
//           quick_shipping: 'Yes',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 180,
//           name: 'Barlow Tyrie Equinox Stacking Sling Counter Armchair - Raw Stainless Steel',
//           description:
//             '<p>The clean lines and understated style of the Barlow Tyrie Equinox Counter Stacking Armchair makes it fit into any setting. The comfortable sling seat gets support from the strong marine-grade stainless steel frame. Both are easy to clean and weather-resistant, making these chairs a great choice for outside entertaining. The UV resistant Textilene sling is available in Charcoal, Platinum, Titanium and Pearl. Stacks to a max of 6 chairs.</p>',
//           price: 695.2,
//           available_colors: '',
//           assembly_required: 'No',
//           quick_shipping: 'Yes',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 209,
//           name: 'Barlow Tyrie Horizon Folding Sling Dining Side Chair',
//           description:
//             '<p>The Barlow Tyrie Horizon Folding Side Chair is great for poolside dining or as casual seating in an area with limited space. This chair has a very pleasing profile with gracefully curved legs and clean, simple lines. The weather-resistant Textilene sling seat and back get support from the durable, plantation-grown teak frame. The sling is available in Charcoal, Titanium, Platinum, and Pearl. The chair is kept securely open by a locking mechanism. It folds by lifting the seat. An armchair version is also available.</p>',
//           price: 623.2,
//           available_colors: '',
//           assembly_required: 'No',
//           quick_shipping: 'Yes',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 195,
//           name: 'Barlow Tyrie Glenham Teak Garden Armchair',
//           description:
//             '<p>The Barlow Tyrie Glenham Armchair is the perfect companion piece to the collection of Glenham Benches and will blend with many styles of outdoor teak furniture. The plantation teak garden armchair is as sturdy and durable as it is good looking. For added comfort, a cushion is available as an optional purchase. Customize your look with more than 160 solution-dyed Sunbrella fabrics.</p>',
//           price: 1118.4,
//           available_colors: '',
//           assembly_required: 'No',
//           quick_shipping: 'Yes',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 256,
//           name: 'Barlow Tyrie Monterey Reclining Rope Lounge Chair',
//           description:
//             '<p>Bring stunning, award-winning style to your patio or deck with the Barlow Tyrie Monterey adjustable armchair. The distinctive frame is constructed of solid hardwood teak while the comfortable seat is braided cord woven from Olefin and Textilene for added durability. This all-weather chair is the perfect blend of style, comfort and durability. Optional ottoman also available. Cord is available in brown or chalk.</p>',
//           price: 1708,
//           available_colors: '',
//           assembly_required: 'Yes',
//           quick_shipping: 'Yes',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 84,
//           name: 'Sunset West Montecito Woven Counter Side Chair',
//           description:
//             '<p>The Sunset West Montecito collection is inspired by the Spanish meaning "Little Mountain". The combination of the woven elements along with the Cognac finish of the Montecito are as exquisite as the homes along the coastline in Montecito.</p> <p>Shown in a Cognac finish. The all-weather cushions are standard with Sunbrella Canvas Flax with a Self Welt.</p><p>Additional fabrics available. Email <a href="mailto:customercare@authenteak.com">customercare@authenteak.com</a> for info.</p>',
//           price: 620.1,
//           available_colors: '',
//           assembly_required: 'No',
//           quick_shipping: 'No',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 67,
//           name: 'Sunset West Coronado Woven Counter Side Chair',
//           description:
//             '<p>The Sunset West Coronado, inspired by French country living, is a hand-woven all-weather wicker collection. The subframe of this durable outdoor group is made with a fully-welded powder-coated aluminum frame, while the feet are accented with brushed aluminum. This versatile collection is suitable for both residential and commercial outdoor living.</p> <p>Shown in the Driftwood frame finish. The all-weather cushions are standard with Sunbrella Canvas Flax with a Self Welt.</p><p>Additional fabrics available. Email <a href="mailto:customercare@authenteak.com">customercare@authenteak.com</a> for info.</p>',
//           price: 620.1,
//           available_colors: '',
//           assembly_required: 'No',
//           quick_shipping: 'No',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 83,
//           name: 'Sunset West Montecito Woven Club Chair',
//           description:
//             '<p>The Sunset West Montecito collection is inspired by the Spanish meaning "Little Mountain". The combination of the woven elements along with the Cognac finish of the Montecito are as exquisite as the homes along the coastline in Montecito.</p> <p>Shown in a Cognac finish. The all-weather cushions are standard with Sunbrella Canvas Flax with a Self Welt.</p><p>Additional fabrics available. Email <a href="mailto:customercare@authenteak.com">customercare@authenteak.com</a> for info.</p>',
//           price: 1223.1,
//           available_colors: '',
//           assembly_required: 'No',
//           quick_shipping: 'No',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 208,
//           name: 'Barlow Tyrie Horizon Folding Sling Dining Armchair',
//           description:
//             '<p>The Barlow Tyrie Horizon Folding Armchair is perfect by the pool or on a small porch, patio or anywhere additional seating is needed. The gracefully curved legs and clean lines make for a very pleasing profile. The plantation-grown teak frame is durable and provides support for the weather-resistant Textilene sling seat and back. The colors available for the Textilene sling are Charcoal, Titanium, Platinum, and Pearl. A locking mechanism holds the chair open securely and it folds by lifting the seat. A side chair version is also available.</p>',
//           price: 751.2,
//           available_colors: '',
//           assembly_required: 'No',
//           quick_shipping: 'Yes',
//           free_shipping: 'Yes',
//         },
//         {
//           id: 211,
//           name: 'Barlow Tyrie Horizon Stacking Sling Dining Armchair',
//           description:
//             "<p>The Barlow Tyrie Horizon Stacking Sling Dining Armchair helps create a memorable outdoor dining experience. The easy comfort of the Textilene sling and the gentle arch of the chair's back make this chair easy to relax in while dining with friends or family. This chair can conveniently be stacked and stored when not in use. Its frame is constructed of genetically engineered teak for durability and is naturally weather resistant. The Textilene sling is available in four colors - Charcoal, Pearl, Titanium, and Platinum. This chair is also available in an all teak version.</p>",
//           price: 799.2,
//           available_colors: '',
//           assembly_required: 'No',
//           quick_shipping: 'Yes',
//           free_shipping: 'Yes',
//         },
//       ],
//     },
//   },
// ];
