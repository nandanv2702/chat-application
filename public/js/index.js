// need to make JS for responsive navbar

// function for auto resizing textarea taken from Stack Overflow
function init() {
  if (window.attachEvent) {
    var observe = function(element, event, handler) {
      element.attachEvent('on' + event, handler);
    };
  } else {
    var observe = function(element, event, handler) {
      element.addEventListener(event, handler, false);
    };
  }
  var text = document.getElementById('text');

  function resize() {
    text.style.height = 'auto';
    text.style.height = text.scrollHeight + 'px';
  }
  /* 0-timeout to get the already changed text */
  function delayedResize() {
    window.setTimeout(resize, 0);
  }
  observe(text, 'change', resize);
  observe(text, 'cut', delayedResize);
  observe(text, 'paste', delayedResize);
  observe(text, 'drop', delayedResize);
  observe(text, 'keydown', delayedResize);

  text.focus();
  text.select();
  resize();
}
