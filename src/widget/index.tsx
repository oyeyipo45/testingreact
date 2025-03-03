import { hydrateRoot } from 'react-dom/client';
import { WidgetContainer } from './components/widget-container';
import './styles/style.css';

function initializeWidget() {
  if (document.readyState !== 'loading') {
    onReady();
  } else {
    document.addEventListener('DOMContentLoaded', onReady);
  }
}

function onReady() {
  try {
    const element = document.createElement('div');
    const shadow = element.attachShadow({ mode: 'open' });
    const shadowRoot = document.createElement('div');
    const clientKey = getClientKey();

    shadowRoot.id = 'widget-root';

    const component = <WidgetContainer clientKey={clientKey} />;

    shadow.appendChild(shadowRoot);
    injectStyle(shadowRoot);
    hydrateRoot(shadowRoot, component);

    document.body.appendChild(element);
  } catch (error) {
    console.warn('Widget initialization failed:', error);
  }
}

// function onReady() {
//   try {
//     const element = document.createElement('div');
//     const shadow = element.attachShadow({ mode: 'open' });
//     const shadowRoot = document.createElement('div');
//     const clientKey = getClientKey();

//     shadowRoot.id = 'widget-root';

//     const component = <WidgetContainer clientKey={clientKey} />;

//     shadow.appendChild(shadowRoot);
//     injectStyle(shadowRoot);
//     hydrateRoot(shadowRoot, component);

//     const iframe = document.createElement('iframe');
//     iframe.style.position = 'fixed';
//     iframe.style.bottom = '0';
//     iframe.style.right = '0';
//     iframe.style.width = '100%';
//     iframe.style.height = '100%';
//     iframe.style.bottom = '20px';
//     iframe.style.right = '20px';
//     iframe.style.width = '400px';
//     iframe.style.height = '600px';
//     iframe.style.border = 'none';
//     iframe.style.zIndex = '999999';
//     iframe.src = 'http://localhost:3000';

//     iframe.style.borderRadius = '10px';
//     iframe.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.15)';
//     // Get the current script's src attribute to determine the widget URL
//     // const currentScript =
//     //   document.currentScript ||
//     //   (function () {
//     //     const scripts = document.getElementsByTagName('script');
//     //     return scripts[scripts.length - 1];
//     //   })();
//     // // Extract the base URL from the script src
//     // const scriptSrc = currentScript.src;
//     // const baseUrl = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));
//     // const widgetUrl = baseUrl.replace('/public', '');
//     // console.log(widgetUrl, 'widgetUrl');

//     element.appendChild(iframe);
//     iframe.src = 'http://localhost:3000';
//     document.body.appendChild(element);

//     // document.body.appendChild(element);
//   } catch (error) {
//     console.warn('Widget initialization failed:', error);
//   }
// }

function injectStyle(shadowRoot: HTMLElement) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  const fileName = process.env.WIDGET_NAME || 'widget';
  // link.href = process.env.WIDGET_CSS_URL || `/${fileName}.css`;
  link.href = 'http://authenteak-frontend.pages.dev/widget.css';
  shadowRoot.appendChild(link);
}

function getClientKey() {
  const script = document.currentScript as HTMLScriptElement;
  const clientKey = script?.getAttribute('data-client-key');

  if (!clientKey || clientKey !== 'client_abc123') {
    throw new Error('Missing data-client-key attribute');
  }

  return clientKey;
}

initializeWidget();
