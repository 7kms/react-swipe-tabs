import { createContext } from 'react';
import { Tab } from './interface';

export interface TabContextProps {
  tabs?: Tab[];
}

export default createContext<TabContextProps>({});
