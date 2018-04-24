
import { resolve } from 'path';

export * from './mockAPI/base.api';
export * from './mockAPI/db';
export * from './mockAPI/util';


export const baseContentsPath = () => resolve(__dirname, 'public/');