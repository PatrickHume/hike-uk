import React from 'react';
import Link, { LinkProps } from '@mui/material/Link';

type ShortLinkProps = {
  website: string;
  length?: number;
} & LinkProps;

const withExtendedFunctionality = (LinkComponent: React.ComponentType<LinkProps>) => {
  const EnhancedComponent: React.FC<ShortLinkProps> = ({ website, length = 20, ...rest }) => {
    let displayLink = website;
    let domain = '';

    try {
      const url = new URL(website);
      domain = url.hostname;
    } catch (error) {
      // Handle invalid URLs if needed
    }

    return (
      <LinkComponent href={website} {...rest}>
        {domain}
      </LinkComponent>
    );
  };

  return EnhancedComponent;
};

const ShortLink = withExtendedFunctionality(Link);

ShortLink.displayName = 'ShortLink';
export default ShortLink;
