import { useEffect } from "react";

/** 移动端软键盘弹出时，同步 --keyboard-inset 供模态框避让 */
export function useKeyboardInset(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      document.documentElement.style.setProperty("--keyboard-inset", `${inset}px`);
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      document.documentElement.style.setProperty("--keyboard-inset", "0px");
    };
  }, [active]);
}

export function scrollInputIntoView(el: HTMLElement | null) {
  if (!el) return;
  requestAnimationFrame(() => {
    el.scrollIntoView({ block: "center", behavior: "smooth" });
  });
}
