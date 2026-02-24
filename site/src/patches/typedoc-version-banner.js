const React = require('react');
const Link = require('@docusaurus/Link');
const client = require('@docusaurus/plugin-content-docs/client');
const { ThemeClassNames } = require('@docusaurus/theme-common');

function VersionBanner() {
  const versionData = client.useDocsVersion();
  if (!versionData) {
    return null;
  }

  const { banner, docs, pluginId, version } = versionData;
  const { latestVersionSuggestion } = client.useDocVersionSuggestions(pluginId);
  const { savePreferredVersionName } = client.useDocsPreferredVersion(pluginId);

  if (!banner || !latestVersionSuggestion) {
    return null;
  }

  const latestVersionInfo =
    docs?.[latestVersionSuggestion.label] ??
    docs?.[latestVersionSuggestion.name];

  if (!latestVersionInfo?.id) {
    return null;
  }

  const handleClick = () => {
    if (latestVersionSuggestion.name) {
      savePreferredVersionName(latestVersionSuggestion.name);
    }
  };

  return React.createElement(
    'div',
    {
      className: `${ThemeClassNames.docs.docVersionBanner} alert alert--warning margin-bottom--md`,
      role: 'alert',
    },
    React.createElement(
      'div',
      null,
      banner === 'unreleased' &&
        React.createElement(React.Fragment, null, 'This is documentation for an unreleased version.'),
      banner === 'unmaintained' &&
        React.createElement(
          React.Fragment,
          null,
          'This is documentation for version ',
          React.createElement('b', null, version),
          '.'
        ),
      ' For the latest API, see version ',
      React.createElement(
        'b',
        null,
        React.createElement(
          Link,
          {
            to: latestVersionInfo.id,
            onClick: handleClick,
          },
          latestVersionInfo.title
        )
      ),
      '.'
    )
  );
}

exports.VersionBanner = VersionBanner;
