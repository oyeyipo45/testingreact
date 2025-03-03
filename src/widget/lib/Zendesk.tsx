
export function Zendesk() {
  const dd_client = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN;
  const dd_site = process.env.NEXT_PUBLIC_DATADOG_SITE;
  const ENV = process.env.NEXT_PUBLIC_ENV;
  const application_id = process.env.NEXT_PUBLIC_APPLICATION_ID;

  return (
    <Script
      id='data-dog'
      strategy='afterInteractive'
      dangerouslySetInnerHTML={{
        __html: `
              (function(h,o,u,n,d) {
            h=h[d]=h[d]||{q:[],onReady:function(c){h.q.push(c)}}
            d=o.createElement(u);d.async=1;d.src=n
            n=o.getElementsByTagName(u)[0];n.parentNode.insertBefore(d,n)
            })(window,document,'script','https://www.datadoghq-browser-agent.com/us1/v5/datadog-logs.js','DD_LOGS')
           window.DD_LOGS.onReady(function() {
           window.DD_LOGS.init({
            clientToken: "${dd_client}",
            site: "${dd_site}",
            forwardErrorsToLogs: true,
            sessionSampleRate: 100,
            forwardConsoleLogs: "all",
            trackUserInteractions: true,
            trackResources: true,
            trackLongTasks: true,
            env : "${ENV}",
            service: "whitelabel",
            applicationId: "${application_id}",
             })
          })
        `,
      }}
    />
  );
}
