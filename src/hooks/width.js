const { useState, useEffect } = require("react");

export const useWidth = (id) => {
  let div = document.getElementById(id);

  let [width, setWidth] = useState(0);

  useEffect(() => {
    let div = document.getElementById(id);

    setWidth(div.offsetWidth);
    let listener = window.addEventListener("resize", () => {
      div = document.getElementById(id);

      setWidth(div ? div.offsetWidth : window.innerWidth);
    });

    return listener;
  }, []);

  return width;
};