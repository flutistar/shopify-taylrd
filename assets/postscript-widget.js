(__ps_shop_id = "2616"),
(function() {
  var t = !1,
  e = function() {
    if (document.readyState && !/loaded|complete/.test(document.readyState))
      return void setTimeout(e, 10);
    if (!t) return (t = !0), void setTimeout(e, 50);
    var n = document.createElement("script");
    n.setAttribute("async", "true"),
    (n.type = "text/javascript"),
    (n.src = ("https://static.postscript.io" + "/" + __ps_shop_id + "/loader.js")),
    (
      (document.getElementsByTagName("head") || [null])[0] ||
      document.getElementsByTagName("script")[0].parentNode
    ).appendChild(n);
  },
  setCookie = function(name, value, days) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  },
  getCookie = function(name) {
    var nameEQ = name + "=";
    var ca = window.parent.document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };
  try{
    var popStatus = getCookie('_ps_pop');
    window.ps__pop_status = popStatus;
    window.addEventListener('message', event => {
      if (event.origin === "https://static.postscript.io") {
        if (event.data.hasOwnProperty("SetCookie")) {
          setCookie(event.data.SetCookie.name, event.data.SetCookie.status, event.data.SetCookie.expiration);
        }
      }
    });
    var url = new URL(window.location.href);
    var psID = url.searchParams.get("s-id");
    var popupParam = url.searchParams.get("popup");
    var popupParamCookie = getCookie('_ps_pop_param');
    var hidePopup = false;
    if(popupParamCookie === 'always' || popupParamCookie === 'session') hidePopup = true;
    if(popupParam){
      switch(popupParam){
        case 'none':
          hidePopup = true;
          break;
        case 'page_hide':
          hidePopup = true;
          break;
        case 'session_hide':
          hidePopup = true;
          if(popupParamCookie !== 'always') setCookie('_ps_pop_param', 'session', 0.02);
          break;
        case 'always_hide':
          hidePopup = true;
          setCookie('_ps_pop_param', 'always', 3650);
          break;
        case 'minimize':
          if(!popStatus) {
            window.ps__pop_status = 'r';
            setCookie('_ps_pop', 'r', 0.02);
          }
          break;
      }
    }
    if (!psID) psID = getCookie('ps_id');
    if (!psID && !hidePopup) e();
  } catch(e){}
})()