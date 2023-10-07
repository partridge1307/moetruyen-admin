import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  MenuTextMatch,
  useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin';
import { $createTextNode, $getSelection, TextNode } from 'lexical';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { $createMentionNode } from '../../nodes/Mention';

const mentionCache = new Map();
const LENGTH_LIMIT = 30;
const ALIAS_LENGTH_LIMIT = 15;
const SUGGESTION_LIST_LENGTH_LIMIT = 5;

const PUNCTUATION =
  '\\.,\\+\\*\\?\\$\\@\\|#{}\\(\\)\\^\\-\\[\\]\\\\/!%\'"~=<>_:;';
const NAME = '\\b[A-Z][^\\s' + PUNCTUATION + ']';

const DocumentMentionsRegex = {
  NAME,
  PUNCTUATION,
};

const TRIGGERS = ['@'].join('');
const PUNC = DocumentMentionsRegex.PUNCTUATION;

const VALID_CHARS = '[^' + TRIGGERS + PUNC + '\\s]';
const VALID_JOINS =
  '(?:' +
  '\\.[ |$]|' + // E.g. "r. " in "Mr. Smith"
  ' |' + // E.g. " " in "Josh Duck"
  '[' +
  PUNC +
  ']|' + // E.g. "-' in "Salier-Hellendag"
  ')';

const CapitalizedNameMentionsRegex = new RegExp(
  '(^|[^#])((?:' + DocumentMentionsRegex.NAME + '{' + 1 + ',})$)'
);

const AtSignMentionsRegex = new RegExp(
  '(^|\\s|\\()(' +
    '[' +
    TRIGGERS +
    ']' +
    '((?:' +
    VALID_CHARS +
    VALID_JOINS +
    '){0,' +
    LENGTH_LIMIT +
    '})' +
    ')$'
);

const AtSignMentionsRegexAliasRegex = new RegExp(
  '(^|\\s|\\()(' +
    '[' +
    TRIGGERS +
    ']' +
    '((?:' +
    VALID_CHARS +
    '){0,' +
    ALIAS_LENGTH_LIMIT +
    '})' +
    ')$'
);

const mentionLookUpService = {
  search: async (
    string: string,
    // eslint-disable-next-line no-unused-vars
    callback: (results: { name: string; id: string }[]) => void
  ): Promise<void> => {
    fetch(`/api/search/user?q=${string}`, { method: 'GET' })
      .then((res) => res.json())
      .then((data) => callback(data));

    return;
  },
};

function useMentionLookUpService(mentionString: string | null) {
  const [results, setResults] = useState<{ name: string; id: string }[]>([]);

  useEffect(() => {
    const cachedResults = mentionCache.get(mentionString);

    if (mentionString === null) {
      setResults([]);
      return;
    }

    if (cachedResults === null) {
      return;
    } else if (cachedResults !== undefined) {
      setResults(cachedResults);
      return;
    }

    mentionCache.set(mentionString, null);
    mentionLookUpService.search(mentionString, (newResults) => {
      mentionCache.set(mentionString, newResults);
      setResults(newResults);
    });
  }, [mentionString]);

  return results;
}

function checkForCapitalizedNameMentions(
  text: string,
  minMaxLength: number
): MenuTextMatch | null {
  const match = CapitalizedNameMentionsRegex.exec(text);
  if (match !== null) {
    const maybeLeadingWhiteSpace = match[1];

    const matchingString = match[2];
    if (matchingString != null && matchingString.length >= minMaxLength) {
      return {
        leadOffset: match.index + maybeLeadingWhiteSpace.length,
        matchingString,
        replaceableString: matchingString,
      };
    }
  }

  return null;
}

function checkForAtSignMentions(
  text: string,
  minMatchLength: number
): MenuTextMatch | null {
  let match = AtSignMentionsRegex.exec(text);

  if (match === null) {
    match = AtSignMentionsRegexAliasRegex.exec(text);
  }
  if (match !== null) {
    const maybeLeadingWhiteSpace = match[1];

    const matchingString = match[3];
    if (matchingString.length >= minMatchLength) {
      return {
        leadOffset: match.index + maybeLeadingWhiteSpace.length,
        matchingString,
        replaceableString: match[2],
      };
    }
  }

  return null;
}

function getPossibleQueryMatch(text: string): MenuTextMatch | null {
  const match = checkForAtSignMentions(text, 1);
  return match === null ? checkForCapitalizedNameMentions(text, 20) : match;
}

function MentionsTypeAheadMenuItem({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: MentionTypeAheadOption;
}) {
  let className = 'item';

  if (isSelected) {
    className += ' selected';
  }

  return (
    <li
      key={option.key}
      tabIndex={-1}
      className={className}
      ref={option.setRefElement}
      role="option"
      aria-selected={isSelected}
      id={`typeahead-item-` + index}
      onMouseEnter={onMouseEnter}
      onClick={() => onClick()}
    >
      <span>{option.name}</span>
    </li>
  );
}

class MentionTypeAheadOption extends MenuOption {
  user: { id: string; name: string };
  name: string;

  constructor(user: { id: string; name: string }, name: string) {
    super(name);
    this.user = user;
    this.name = name;
  }
}

export default function MentionsPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const [queryStr, setQueryStr] = useState<string | null>(null);

  const results = useMentionLookUpService(queryStr);

  const checkForHashTriggerMatch = useBasicTypeaheadTriggerMatch('/', {
    minLength: 0,
  });

  const options = useMemo(
    () =>
      results
        .map((result) => new MentionTypeAheadOption(result, result.name))
        .slice(0, SUGGESTION_LIST_LENGTH_LIMIT),
    [results]
  );

  const onSelectOption = useCallback(
    (
      selectedOption: MentionTypeAheadOption,
      nodeToReplace: TextNode | null,
      closeMenu: () => void
    ) => {
      editor.update(() => {
        const mentionNode = $createMentionNode(
          selectedOption.user,
          selectedOption.name
        );
        if (nodeToReplace) {
          nodeToReplace.replace(mentionNode);
        }
        mentionNode.select();
        const selection = $getSelection();

        selection?.insertNodes([$createTextNode(' ')]);
        closeMenu();
      });
    },
    [editor]
  );

  const checkForMentionMatch = useCallback(
    (text: string) => {
      const hashMatch = checkForHashTriggerMatch(text, editor);

      if (hashMatch !== null) {
        return null;
      }
      return getPossibleQueryMatch(text);
    },
    [checkForHashTriggerMatch, editor]
  );

  return (
    <LexicalTypeaheadMenuPlugin<MentionTypeAheadOption>
      onQueryChange={setQueryStr}
      onSelectOption={onSelectOption}
      triggerFn={checkForMentionMatch}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
      ) =>
        !!anchorElementRef.current && results.length
          ? createPortal(
              <div className="typeahead-popover mentions-menu">
                <ul>
                  {options.map((option, idx) => (
                    <MentionsTypeAheadMenuItem
                      key={option.key}
                      index={idx}
                      isSelected={selectedIndex === idx}
                      onClick={() => {
                        setHighlightedIndex(idx);
                        selectOptionAndCleanUp(option);
                      }}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      option={option}
                    />
                  ))}
                </ul>
              </div>,
              anchorElementRef.current
            )
          : null
      }
    />
  );
}
