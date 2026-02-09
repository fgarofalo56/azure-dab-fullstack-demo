/**
 * Icon Components Tests
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  TrainIcon,
  BridgeIcon,
  BusIcon,
  CarIcon,
  GraphQLIcon,
  CodeIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  CheckIcon,
  MicrosoftIcon,
  InboxIcon,
  getIcon,
} from '../components/icons';

describe('TrainIcon', () => {
  it('renders SVG element', () => {
    const { container } = render(<TrainIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies default className', () => {
    const { container } = render(<TrainIcon />);
    expect(container.querySelector('svg')).toHaveClass('w-8', 'h-8');
  });

  it('applies custom className', () => {
    const { container } = render(<TrainIcon className="w-12 h-12" />);
    expect(container.querySelector('svg')).toHaveClass('w-12', 'h-12');
  });
});

describe('BridgeIcon', () => {
  it('renders SVG element', () => {
    const { container } = render(<BridgeIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<BridgeIcon className="w-6 h-6" />);
    expect(container.querySelector('svg')).toHaveClass('w-6', 'h-6');
  });
});

describe('BusIcon', () => {
  it('renders SVG element', () => {
    const { container } = render(<BusIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<BusIcon className="w-10 h-10" />);
    expect(container.querySelector('svg')).toHaveClass('w-10', 'h-10');
  });
});

describe('CarIcon', () => {
  it('renders SVG element', () => {
    const { container } = render(<CarIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<CarIcon className="w-4 h-4" />);
    expect(container.querySelector('svg')).toHaveClass('w-4', 'h-4');
  });
});

describe('GraphQLIcon', () => {
  it('renders SVG element', () => {
    const { container } = render(<GraphQLIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies default className', () => {
    const { container } = render(<GraphQLIcon />);
    expect(container.querySelector('svg')).toHaveClass('w-6', 'h-6');
  });
});

describe('CodeIcon', () => {
  it('renders SVG element', () => {
    const { container } = render(<CodeIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies default className', () => {
    const { container } = render(<CodeIcon />);
    expect(container.querySelector('svg')).toHaveClass('w-5', 'h-5');
  });
});

describe('ChevronRightIcon', () => {
  it('renders SVG element', () => {
    const { container } = render(<ChevronRightIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies default className', () => {
    const { container } = render(<ChevronRightIcon />);
    expect(container.querySelector('svg')).toHaveClass('w-5', 'h-5');
  });
});

describe('ChevronLeftIcon', () => {
  it('renders SVG element', () => {
    const { container } = render(<ChevronLeftIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});

describe('CheckIcon', () => {
  it('renders SVG element', () => {
    const { container } = render(<CheckIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies default className', () => {
    const { container } = render(<CheckIcon />);
    expect(container.querySelector('svg')).toHaveClass('w-3', 'h-3');
  });
});

describe('MicrosoftIcon', () => {
  it('renders SVG element', () => {
    const { container } = render(<MicrosoftIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies default className', () => {
    const { container } = render(<MicrosoftIcon />);
    expect(container.querySelector('svg')).toHaveClass('w-6', 'h-6');
  });
});

describe('InboxIcon', () => {
  it('renders SVG element', () => {
    const { container } = render(<InboxIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies default className', () => {
    const { container } = render(<InboxIcon />);
    expect(container.querySelector('svg')).toHaveClass('w-8', 'h-8');
  });
});

describe('getIcon', () => {
  it('returns TrainIcon for "train"', () => {
    const { container } = render(getIcon('train'));
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('returns BridgeIcon for "bridge"', () => {
    const { container } = render(getIcon('bridge'));
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('returns BusIcon for "bus"', () => {
    const { container } = render(getIcon('bus'));
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('returns CarIcon for "car"', () => {
    const { container } = render(getIcon('car'));
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('returns GraphQLIcon for "graphql"', () => {
    const { container } = render(getIcon('graphql'));
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('returns CodeIcon for "code"', () => {
    const { container } = render(getIcon('code'));
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('returns TrainIcon as default for unknown name', () => {
    const { container } = render(getIcon('unknown'));
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies custom className to returned icon', () => {
    const { container } = render(getIcon('train', 'custom-class'));
    expect(container.querySelector('svg')).toHaveClass('custom-class');
  });
});
