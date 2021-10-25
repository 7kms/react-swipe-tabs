import * as React from 'react';
import { Tab, TabPosition, RenderTabBar } from '../interface';
import classNames from 'classnames/bind';
import styles from '../index.less';
const cx = classNames.bind(styles);

export interface TabNodeProps {
  tab: Tab;
  active: boolean;
  rtl: boolean;
  closable?: boolean;
  onClick?: (e: React.MouseEvent | React.KeyboardEvent) => void;
  onResize?: (width: number, height: number, left: number, top: number) => void;
  tabBarGutter?: number;
  removeAriaLabel?: string;
  removeIcon?: React.ReactNode;
  renderTabBar?: RenderTabBar;
  className?: string;

  style?: React.CSSProperties;
}

function TabNode(
  { tab: tabObj, style, onClick, renderTabBar, className, active }: TabNodeProps,
  ref: React.Ref<HTMLDivElement>
) {
  const { key, tab, disabled } = tabObj;

  function onInternalClick(e: React.MouseEvent) {
    if (disabled) return;
    onClick?.(e);
  }

  return (
    <div
      key={key}
      ref={ref}
      className={cx('tab-bar', className)}
      style={style}
      onClick={onInternalClick}
    >
      {renderTabBar ? renderTabBar(tabObj, active) : tab}
    </div>
  );
}

export default React.forwardRef(TabNode);
