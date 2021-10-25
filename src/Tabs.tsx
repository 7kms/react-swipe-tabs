// Accessibility https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Tab_Role
import React, { useCallback, useEffect, useState } from 'react';
import TabNavList from './TabNavList';
import TabPanelList from './TabPanelList';
import TabPane, { TabPanelProps } from './TabPanelList/TabPanel';
import { RenderTabBar, AnimatedConfig, Tab } from './interface';
import TabContext from './TabContext';
import classNames from 'classnames/bind';
import styles from './index.less';
const cx = classNames.bind(styles);

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  activeKey: string; // 当前活跃状态

  className?: string;
  tabBarClassName?: string;
  tabContentClassName?: string;
  inkBarClassName?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  id?: string;

  direction?: 'ltr' | 'rtl';
  forceRender?: boolean;
  renderTabBar?: RenderTabBar;
  tabBarStyle?: React.CSSProperties;
  destroyInactiveTabPane?: boolean;

  onChange?: (activeKey: string) => void;
  onTabClick?: (activeKey: string, e: React.KeyboardEvent | React.MouseEvent) => void;

  /** @private Internal usage. Not promise will rename in future */
  moreTransitionName?: string;
}

function parseTabList(children: React.ReactNode): Tab[] {
  const childrenList: React.ReactElement[] = [];
  React.Children.forEach(children, (child: any) => {
    if (child === undefined || child === null) {
      return;
    }
    childrenList.push(child);
  });
  const tabList: Tab[] = [];
  childrenList.map((node: React.ReactElement<TabPanelProps>, index) => {
    if (React.isValidElement(node)) {
      const key = node.key !== undefined ? String(node.key) : undefined;
      tabList.push({
        index,
        key,
        ...node.props,
        node,
      } as Tab);
    }
  });
  return tabList;
}

const useTabState = (defaultActiveKey: string, tabs: Tab[], onChange?: (key: string) => void) => {
  const defaultTabIndex = tabs.findIndex((item) => item.key === defaultActiveKey);
  const [tabState, setTabState] = useState({
    needAnimate: true,
    currentTabIndex: Math.max(defaultTabIndex, 0),
    currentActiveKey: defaultActiveKey,
  });

  /**
   * @threshold: numbmer阀值0.1, 当超过阀值时, pan才生效. 否则恢复原位
   */
  const getOffsetIndex = useCallback(
    (current: number, width: number, threshold: number = 0.1) => {
      // current = Math.max(Math.min(current, 0), -width * tabs.length);
      const ratio = Math.abs(current / width);
      const direction = ratio > tabState.currentTabIndex ? 'next' : 'prev';
      console.log(
        `current=${current} width=${width} threshold=${threshold} ratio=${ratio} direction=${direction}`
      );
      const index = Math.floor(ratio);
      let targetIndex: number = 0;
      switch (direction) {
        case 'next': // 下一个(ltr:左滑, rtl:右滑)
          targetIndex = ratio - index > threshold ? index + 1 : index;
          break;
        case 'prev': // 上一个(ltr:右滑, rtl:左滑)
          targetIndex = 1 - ratio + index > threshold ? index : index + 1;
          break;
        default:
          targetIndex = Math.round(ratio);
      }
      if (Math.abs(targetIndex - tabState.currentTabIndex) > 1) {
        debugger;
      }
      console.log(targetIndex);
      targetIndex = Math.min(tabs.length - 1, Math.max(targetIndex, 0));
      return {
        targetIndex,
        currentTabIndex: tabState.currentTabIndex,
      };
    },
    [tabState.currentTabIndex]
  );

  const goToTab = useCallback(
    (index: number | 'prev' | 'next', needAnimate: boolean = true) => {
      let targetIndex;
      if (typeof index === 'string') {
        if (index === 'prev') {
          targetIndex = tabState.currentTabIndex - 1;
        } else {
          targetIndex = tabState.currentTabIndex - 1;
        }
      } else {
        targetIndex = index;
      }
      if (targetIndex >= 0 && targetIndex < tabs.length) {
        setTabState({
          needAnimate,
          currentTabIndex: targetIndex,
          currentActiveKey: tabs[index].key,
        });
        onChange && onChange(tabs[index].key);
      }
    },
    [tabs]
  );

  return {
    tabState,
    getOffsetIndex,
    goToTab,
  };
};

function Tabs(
  {
    id,
    className,
    tabBarClassName,
    inkBarClassName,
    tabContentClassName,
    children,
    direction,
    activeKey,
    tabBarStyle,
    moreTransitionName,
    destroyInactiveTabPane,
    renderTabBar,
    onChange,
    onTabClick,
    forceRender,
    ...restProps
  }: TabsProps,
  ref: React.Ref<HTMLDivElement>
) {
  const navRef: React.Ref<HTMLDivElement> = React.createRef<HTMLDivElement>();
  const tabs = parseTabList(children);
  const rtl = direction === 'rtl';

  const { tabState, goToTab, getOffsetIndex } = useTabState(activeKey, tabs, onChange);

  function onInternalTabClick(
    key: string,
    index: number,
    e: React.MouseEvent | React.KeyboardEvent
  ) {
    // 点击tab不触发动画, 只有pan手势才触发动画
    goToTab(index, false);
  }

  const sharedProps = {
    animated: tabState.needAnimate,
    rtl,
    mobile: true,
    activeIndex: tabState.currentTabIndex,
    activeKey: tabState.currentActiveKey,
    getOffsetIndex,
    goToTab,
  };

  const tabNavBarProps = {
    ...sharedProps,
    moreTransitionName,
    onTabClick: onInternalTabClick,
    renderTabBar,
    style: tabBarStyle,
    tabBarClassName,
    inkBarClassName,
    panes: children,
    ref: navRef,
  };

  return (
    <TabContext.Provider value={{ tabs }}>
      <div
        ref={ref}
        id={id}
        className={cx(
          'scroll-tab-wrap',
          {
            [`rtl`]: rtl,
          },
          className
        )}
        {...restProps}
      >
        <TabNavList {...tabNavBarProps} />
        <TabPanelList {...sharedProps} forceRender={forceRender} className={tabContentClassName} />
      </div>
    </TabContext.Provider>
  );
}

const ForwardTabs = React.forwardRef(Tabs);

export type ForwardTabsType = typeof ForwardTabs & { TabPane: typeof TabPane };

(ForwardTabs as ForwardTabsType).TabPane = TabPane;

export default ForwardTabs as ForwardTabsType;
