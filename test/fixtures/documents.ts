/** Markdown documents that must survive the trip to Draft.js and back unchanged. */
export const documents: Record<string, string> = {
  'getting started': [
    '# Build with Expo',
    'Expo lets you build __universal__ apps with *React Native*.',
    '- Install the CLI',
    '    - Run npx create-expo-app',
    '- Start the dev server',
    '1. Open the app in Expo Go',
    '2. Edit App.tsx',
    '> Tip: press r to reload 🚀',
    '```sh',
    'npx expo start',
    '```',
    'Read the [docs](https://docs.expo.dev) or view the ![logo](https://expo.dev/logo.png) 🎉',
  ].join('\n'),
  'nested styles and links': [
    '## Release notes',
    'The __*EAS Build*__ service is *now generally available*.',
    'See the __[changelog](https://expo.dev/changelog)__ and the *[blog](https://expo.dev/blog)*.',
    '',
    'Questions? Ask on [Discord](https://chat.expo.dev) 💬',
  ].join('\n'),
  'lists with styles': [
    '- __Bold__ item',
    '    1. *Italic* nested item',
    '    2. Nested item with a [link](https://expo.dev)',
    '- Plain item 🍎',
  ].join('\n'),
};
