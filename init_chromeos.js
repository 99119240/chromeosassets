/**
 * The loading start time.
 * @type {number}
 */
window.InputViewPageStartLoading = new Date().getTime();

/**
 * Reports a JS error to the crash server.
 * @param {!ErrorEvent} error
 */
function reportError({message, filename, lineno, colno, error}) {
  chrome.crashReportPrivate.reportError(
      {
        message,
        url: filename,
        lineNumber: lineno,
        columnNumber: colno,
        debugId: version,
        stackTrace: error?.stack || new Error().stack,
      },
      () => {});
}

window.addEventListener('error', (message, source, lineno, colno, error) => {
  // Sometimes all the information just comes in the message object.
  if (!(typeof message === 'string' || message instanceof String)) {
    source = message.filename;
    lineno = message.lineno;
    colno = message.colno;
    message = message.message;
  }
  reportError(message, source, lineno, colno, error);
});

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  if (reason instanceof ErrorEvent) {
    reportError(reason);
  } else {
    reportError(new ErrorEvent('error', {
      message: 'Unhandled promise rejection',
      filename: window.location.href,
      error: event
    }));
  }
});

window.addEventListener('load', () => {
  chrome.runtime.getBackgroundPage((backgroundPage) => {
    backgroundPage['inputviewWindow'] = window;
    chrome.runtime.sendMessage({'type': 'inputview_load'});
  });
});
