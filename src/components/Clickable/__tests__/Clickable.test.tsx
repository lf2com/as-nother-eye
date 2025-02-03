import type { ComponentProps } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Clickable from '../Clickable';

describe('Clickable', () => {
  const renderer = (props: ComponentProps<typeof Clickable>) =>
    render(<Clickable {...props} />);

  it('should render content', () => {
    renderer({ children: 'test-content' });

    expect(screen.getByText('test-content')).toBeInstanceOf(HTMLElement);
  });

  it('should call onClick on click', async () => {
    const onClick = jest.fn();

    renderer({
      children: 'test-content',
      onClick,
    });

    expect(onClick).not.toHaveBeenCalled();

    await userEvent.click(screen.getByText('test-content'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick if click with disabled prop', async () => {
    const onClick = jest.fn();

    renderer({
      disabled: true,
      children: 'test-content',
      onClick,
    });

    await userEvent.click(screen.getByText('test-content'));

    expect(onClick).not.toHaveBeenCalled();
  });
});
