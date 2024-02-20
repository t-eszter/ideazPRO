//getCSRFToken.js
import React from "react";

export function getCookie(name) {
  const cookieValue = document.cookie.match(
    "(^|;)\\s*" + name + "\\s*=\\s*([^;]+)"
  );
  return cookieValue ? cookieValue.pop() : "";
}

function CSRFToken() {
  const csrftoken = getCookie("csrftoken");

  return <input type="hidden" name="csrfmiddlewaretoken" value={csrftoken} />;
}

export default CSRFToken;
