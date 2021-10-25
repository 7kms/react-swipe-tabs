import React, { useCallback, useState, useEffect } from 'react';
import Gesture, { IGestureStatus } from 'rc-gesture';
import TabContext from '../TabContext';
import { AnimatedConfig, ITabBaseFn } from '../interface';
import { setPxStyle, setTransform } from '../utils';
import classNames from 'classnames/bind';
import styles from '../index.less';
const cx = classNames.bind(styles);

export interface TabPanelListProps extends ITabBaseFn {
  activeIndex: number;
  activeKey: React.Key;
  rtl: boolean;
  className?: string;
  animated?: boolean;
  forceRender?: boolean;
}

// 给layout外框加上pan和swip手势
const useGesture = ({
  rtl,
  activeIndex,
  layoutRef,
  goToTab,
  getOffsetIndex,
}: {
  rtl: boolean;
  activeIndex: number;
  layoutRef: React.RefObject<HTMLDivElement>;
  goToTab: ITabBaseFn['goToTab'];
  getOffsetIndex: ITabBaseFn['getOffsetIndex'];
}) => {
  let lastOffset: number | string = rtl ? `${activeIndex * 100}%` : `${-activeIndex * 100}%`;
  let finalOffset = 0;

  const getLastOffset = () => {
    let offset = +`${lastOffset}`.replace('%', '');
    if (`${lastOffset}`.indexOf('%') >= 0) {
      offset /= 100;
      offset *= layoutRef.current!.offsetWidth;
    }
    return offset;
  };
  const getContentPosByIndex = (index: number, isVertical: boolean = false) => {
    const value = rtl ? `${index * 100}%` : `${-index * 100}%`;
    setCurrentOffset(value);
    const translate = isVertical ? `0px, ${value}` : `${value}, 0px`;
    // fix: content overlay TabBar on iOS 10. ( 0px -> 1px )
    return `translate3d(${translate}, 1px)`;
  };
  const setCurrentOffset = (offset: number | string) => (lastOffset = offset);
  const [panState, setPanState] = useState({ isMoving: false });
  const gestureObj = {
    onPanStart: (status: IGestureStatus) => {
      status.srcEvent.stopPropagation();
      status.srcEvent.preventDefault();
      if (status.direction !== 2 && status.direction !== 4) {
        return;
      }

      console.log('onPanStart', status);
      setPanState((prevState) => ({
        ...prevState,
        isMoving: true,
      }));
    },

    onPanMove: (status: IGestureStatus) => {
      status.srcEvent.stopPropagation();
      status.srcEvent.preventDefault();
      let offset = getLastOffset();
      if (status.direction !== 2 && status.direction !== 4) {
        finalOffset = offset;
        return;
      }

      offset += status.moveStatus!.x;
      console.log('onPanMove', status.moveStatus!.x, offset);
      setPxStyle(layoutRef.current!, offset, 'px');
      // console.log('onPanMove', offset);
      finalOffset = offset;
    },

    onPanEnd: (status: IGestureStatus) => {
      status.srcEvent.stopPropagation();
      status.srcEvent.preventDefault();
      if (finalOffset === 0) {
        // 没有触发onPanMove, 再次计算以前的offset, 避免直接滚动到0的位置.
        finalOffset = getLastOffset();
      }
      console.log('onPanEnd before', finalOffset);
      finalOffset = rtl ? Math.max(finalOffset, 0) : Math.min(finalOffset, 0);
      console.log('onPanEnd after', status, 'finalOffset', finalOffset);
      lastOffset = finalOffset;
      setPanState((prevState) => ({
        ...prevState,
        isMoving: false,
      }));
      const { currentTabIndex, targetIndex } = getOffsetIndex(
        finalOffset,
        layoutRef.current!.clientWidth,
        status.swipe ? 0 : 0.05
      );
      // console.log(`currentTabIndex=${currentTabIndex}, targetIndex=${targetIndex}`);
      if (status.direction !== 2 && status.direction !== 4) {
        setTransform(layoutRef.current!.style, getContentPosByIndex(currentTabIndex));
      } else {
        // 1.通过offset计算当前页码
        // 2. 如果页码没有变, 通过页码去计算offset
        if (targetIndex === currentTabIndex) {
          setTransform(layoutRef.current!.style, getContentPosByIndex(targetIndex));
        } else {
          goToTab(targetIndex);
        }
      }
    },
  };

  useEffect(() => {
    setTransform(layoutRef.current!.style, getContentPosByIndex(activeIndex));
  }, [activeIndex]);

  return {
    panState,
    gestureObj,
  };
};
export default function TabPanelList({
  activeKey,
  activeIndex,
  rtl,
  animated,
  className,
  goToTab,
  getOffsetIndex,
  forceRender,
}: TabPanelListProps) {
  const { tabs } = React.useContext(TabContext);
  const layoutRef = React.createRef<HTMLDivElement>();
  const { panState, gestureObj } = useGesture({
    rtl,
    activeIndex,
    layoutRef,
    goToTab,
    getOffsetIndex,
  });
  return (
    <Gesture key="$content" {...gestureObj}>
      <div
        className={cx(`content-wrap`, { animated: animated && !panState.isMoving }, className)}
        ref={layoutRef}
      >
        {tabs?.map((tab) => {
          return React.cloneElement(tab.node, {
            key: tab.key,
            tabKey: tab.key,
            active: tab.key === activeKey,
            forceRender,
          });
        })}
      </div>
    </Gesture>
  );
}
