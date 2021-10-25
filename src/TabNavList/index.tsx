import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { scrollTo } from '../utils';
import TabNode from './TabNode';
import { TabSizeMap, RenderTabBar, AnimatedConfig } from '../interface';
import TabContext from '../TabContext';
import useRefs from '../hooks/useRefs';

import classNames from 'classnames/bind';
import styles from '../index.less';
const cx = classNames.bind(styles);
export interface TabNavListProps {
  activeKey: string;
  rtl: boolean;
  panes: React.ReactNode;
  animated?: boolean;
  mobile: boolean;
  renderTabBar?: RenderTabBar;
  className?: string;
  tabBarClassName?: string;
  inkBarClassName?: string;

  style?: React.CSSProperties;
  onTabClick: (activeKey: string, index: number, e: React.MouseEvent | React.KeyboardEvent) => void;
  children?: (node: React.ReactElement) => React.ReactElement;
}

function TabNavList(props: TabNavListProps, ref: React.Ref<HTMLDivElement>) {
  const { tabs } = React.useContext(TabContext);
  const {
    className,
    tabBarClassName,
    inkBarClassName,
    style,
    activeKey,
    rtl,
    onTabClick,
    renderTabBar,
  } = props;

  const [getElementRef, removeElementRef] = useRefs<HTMLDivElement>();

  useEffect(() => {
    const navListDiv = (ref as React.RefObject<HTMLDivElement>).current!;
    const targetBarDiv = getElementRef(activeKey).current!;
    // console.log(`navListDiv.offsetWidth=${navListDiv.offsetWidth} scrollLeft=${navListDiv.scrollLeft} scrollWidth=${navListDiv.scrollWidth}`);
    let baseScrollLeft = 0;
    if (rtl && navListDiv.scrollLeft > 10) {
      // rtl下, 一般来说scrollLeft是负数.
      // 这里是为了做兼容(>10只是取一个经验数字), 有的手机, 即使是rtl, 其scrollLeft还是按照ltr模式进行计算的
      baseScrollLeft = navListDiv.scrollWidth - navListDiv.offsetWidth;
    }
    // 计算中间点的位置(因为滚动条需要滚到视图中央)
    // 当rtl成立时, scrollLeft必然是负数
    const targetScrollLeft =
      baseScrollLeft +
      targetBarDiv.offsetLeft +
      targetBarDiv.offsetWidth / 2 -
      navListDiv.offsetWidth / 2;
    const inkBarDiv = getElementRef('ink').current!;
    inkBarDiv.style.left = `${
      targetBarDiv.offsetLeft + targetBarDiv.offsetWidth / 2 - inkBarDiv.offsetWidth / 2
    }px`;
    // console.log(`targetScrollLeft=${targetScrollLeft}, targetBarDiv.offsetLeft=${targetBarDiv.offsetLeft},targetBarDiv.offsetWidth =${targetBarDiv.offsetWidth }, navListDiv.offsetWidth=${navListDiv.offsetWidth}`);
    scrollTo(navListDiv, 'X', targetScrollLeft, 300);
    // 将inkbar定位到targetBar下方
  }, [activeKey]);

  const tabNodes: React.ReactElement[] = tabs!.map((tab, index) => {
    const { key } = tab;
    return (
      <TabNode
        key={key}
        rtl={rtl}
        tab={tab}
        style={style}
        className={tabBarClassName}
        renderTabBar={renderTabBar}
        active={key === activeKey}
        ref={getElementRef(key)}
        onClick={(e) => {
          onTabClick(key, index, e);
        }}
      />
    );
  });
  return (
    <div ref={ref} role="tablist" className={cx(`nav-wrap`, className, { rtl: rtl })}>
      {tabNodes}
      <div className={cx(`ink-bar`, inkBarClassName)} ref={getElementRef('ink')} />
    </div>
  );
}

export default React.forwardRef(TabNavList);
