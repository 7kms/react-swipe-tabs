import * as React from 'react';
import classNames from 'classnames/bind';
import styles from '../index.less';
const cx = classNames.bind(styles);

export interface TabPanelProps {
  tab?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  children?: React.ReactNode;
  forceRender?: boolean;
  closable?: boolean;
  closeIcon?: React.ReactNode;

  // Pass by TabPaneList
  prefixCls?: string;
  tabKey?: string;
  id?: string;
  animated?: boolean;
  active?: boolean;
  destroyInactiveTabPane?: boolean;
}

export default function TabPane({
  prefixCls,
  forceRender,
  className,
  style,
  id,
  active,
  animated,
  destroyInactiveTabPane,
  tabKey,
  children,
}: TabPanelProps) {
  const [visited, setVisited] = React.useState(forceRender);

  React.useEffect(() => {
    if (active) {
      setVisited(true);
    } else if (destroyInactiveTabPane) {
      setVisited(false);
    }
  }, [active, destroyInactiveTabPane]);

  return (
    <div
      id={id && `${id}-panel-${tabKey}`}
      role="tabpanel"
      tabIndex={active ? 0 : -1}
      aria-labelledby={id && `${id}-tab-${tabKey}`}
      aria-hidden={!active}
      style={style}
      className={cx(`pane-wrap`, active && `pan-active`, className)}
    >
      {(active || visited || forceRender) && children}
    </div>
  );
}
