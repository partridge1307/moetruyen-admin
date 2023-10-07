import { AutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin';

const URL_MATCHER =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

const MATCHERS = [
  (text: string) => {
    const match = URL_MATCHER.exec(text);
    if (match === null) return null;

    return {
      attributes: {
        target: '_blank',
      },
      index: match.index,
      length: match[0].length,
      text: match[0],
      url: match[0],
    };
  },
];

export default function AutoLink(): JSX.Element {
  return <AutoLinkPlugin matchers={MATCHERS} />;
}
