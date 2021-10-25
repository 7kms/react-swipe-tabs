export function getTransformPropValue(v: any) {
  return {
    transform: v,
    WebkitTransform: v,
    MozTransform: v,
  };
}

export function getPxStyle(value: number | string, unit = 'px', vertical: boolean = false) {
  value = vertical ? `0px, ${value}${unit}, 0px` : `${value}${unit}, 0px, 0px`;
  return `translate3d(${value})`;
}

export function setPxStyle(
  el: HTMLElement,
  value: number | string,
  unit = 'px',
  vertical: boolean = false
) {
  setTransform(el.style, getPxStyle(value, unit, vertical));
}

export function setTransform(style: any, v: any) {
  style.transform = v;
  style.webkitTransform = v;
  style.mozTransform = v;
}

export const scrollTo = (
  dom: HTMLElement,
  direction: 'X' | 'Y',
  targetPosition: number,
  duration: number = 300
) => {
  // console.log(dom.scrollLeft, dom.scrollWidth)
  // if (!dom.scrollTo) {
  //   // 处理一下兼容性, 当
  //   return;
  // }
  // const maxScroll =
  //   direction === 'X' ? dom.scrollWidth - dom.offsetWidth : dom.scrollHeight - dom.offsetHeight;
  // targetPosition = Math.min(Math.max(targetPosition, 0), maxScroll);
  let currentPosition: number = direction === 'X' ? dom.scrollLeft : dom.scrollTop;
  if (targetPosition === currentPosition) {
    return;
  }
  let times = 0;
  // const unit_diff = (targetPosition - currentPosition) / (duration / 16.7); // 单位时间变动长度
  const unit_diff = (targetPosition - currentPosition) / 8; // 单位时间变动长度

  requestAnimationFrame(function scroll() {
    times++;
    const currentScrollWith = direction === 'X' ? dom.scrollLeft : dom.scrollTop;
    let position = currentScrollWith + unit_diff;
    let is_ok = Math.abs(targetPosition - position) <= Math.abs(unit_diff) || times >= 10;

    if (is_ok) {
      position = targetPosition;
    }
    if (direction === 'X') {
      dom.scrollLeft = position;
    } else {
      dom.scrollTop = position;
    }
    // console.log(targetPosition, position, is_ok);
    if (!is_ok) {
      requestAnimationFrame(scroll);
    }
  });
};
