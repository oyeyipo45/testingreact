export const shortDescription = (text: string) => {
  const textLength = text?.split(' ').length;
  const parsedText = text?.split(' ').slice(0, 400).join(' ');

  const shortText = textLength < 400 ? text : `${parsedText}...`;

  return shortText as string | TrustedHTML;
};
