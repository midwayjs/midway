import React from 'react';
import DocVersionBanner from '@theme-original/DocVersionBanner';
import { useDocsVersion } from '@docusaurus/plugin-content-docs/client';

export default function SafeDocVersionBanner(props) {
  const versionMetadata = useDocsVersion();

  if (!versionMetadata) {
    return null;
  }

  return <DocVersionBanner {...props} />;
}
