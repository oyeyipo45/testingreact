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

//     const iframeStyle = iframe.style;
//     iframeStyle.boxSizing = 'borderBox';
//     iframeStyle.position = 'absolute';
//     iframeStyle.right = '0';
//     iframeStyle.bottom = '0';
//     iframeStyle.width = '100%';
//     iframeStyle.height = '100%';
//     iframeStyle.border = '0';
//     iframeStyle.margin = '0';
//     iframeStyle.padding = '0';
//     iframeStyle.width = '400px';

//     const ele = element.appendChild(iframe);

//     document.body.appendChild(ele);
//   } catch (error) {
//     console.warn('Widget initialization failed:', error);
//   }
// }

function onReady() {
  try {
    const element = document.createElement('div');
    const shadow = element.attachShadow({ mode: 'open' });
    const shadowRoot = document.createElement('div');
    const clientKey = getClientKey();

    shadowRoot.id = 'widget-root';

    const component = (
      <WidgetContainer clientKey={clientKey} />
    );

    shadow.appendChild(shadowRoot);
    injectStyle(shadowRoot);
    hydrateRoot(shadowRoot, component);

    document.body.appendChild(element);
  } catch (error) {
    console.warn('Widget initialization failed:', error);
  }
}

function injectStyle(shadowRoot: HTMLElement) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  const fileName = process.env.WIDGET_NAME || 'widget';
  link.href = process.env.WIDGET_CSS_URL || `/${fileName}.css`;
  shadowRoot.appendChild(link);
}

function getClientKey() {
  const script = document.currentScript as HTMLScriptElement;
  const clientKey = script?.getAttribute('data-client-key');

  if (!clientKey || clientKey !== "client_abc123") {
    throw new Error('Missing data-client-key attribute');
  }

  return clientKey;
}

initializeWidget();