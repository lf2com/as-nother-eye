import classNames from 'classnames';
import { twMerge } from 'tailwind-merge';

const twClassNames = (...args: Parameters<typeof classNames>) =>
  twMerge(classNames(...args));

export default twClassNames;
