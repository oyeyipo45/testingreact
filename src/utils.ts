import Cookie from 'js-cookie';

export const shortDescription = (text: string) => {
  const textLength = text?.split(' ').length;
  const parsedText = text?.split(' ').slice(0, 400).join(' ');

  const shortText = textLength < 400 ? text : `${parsedText}...`;

  return shortText as string | TrustedHTML;
};

export const getDetails = (name: string) => {
  return Cookie.get(name);
};

export const SetDetails = (name: string, value: string) => {
  Cookie.set(name, value);
};

export const BASE_URL = 'https://authenteak-backend.contextdata.dev';
