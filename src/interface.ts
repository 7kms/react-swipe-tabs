import React from 'react';
import { TabPanelProps } from './TabPanelList/TabPanel';

export type TabSizeMap = Map<
  React.Key,
  { width: number; height: number; left: number; top: number }
>;

export interface TabOffset {
  width: number;
  left: number;
  right: number;
}
export type TabOffsetMap = Map<React.Key, TabOffset>;

export type TabPosition = 'left' | 'right' | 'top' | 'bottom';

export interface Tab extends TabPanelProps {
  index: number;
  key: string;
  node: React.ReactElement;
}

export type RenderTabBar = (obj: any, is_active: boolean) => React.ReactElement;

export interface AnimatedConfig {
  inkBar?: boolean;
  tabPane?: boolean;
}

export interface ITabBaseFn {
  getOffsetIndex: (
    current: number,
    width: number,
    threshold?: number
  ) => {
    targetIndex: number;
    currentTabIndex: number;
  };
  goToTab: (index: number | 'prev' | 'next', needAnimate?: boolean) => void;
}
