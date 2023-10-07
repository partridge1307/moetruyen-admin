import {
  AutoEmbedOption,
  EmbedConfig,
  EmbedMatchResult,
  LexicalAutoEmbedPlugin,
} from '@lexical/react/LexicalAutoEmbedPlugin';
import { LexicalEditor } from 'lexical';
import { createPortal } from 'react-dom';
import { INSERT_TIKTOK_COMMAND } from '../Tiktok';
import { INSERT_YOUTUBE_COMMAND } from '../Youtube';

interface MoetruyenEmbedConfig extends EmbedConfig {
  // Human readable name of the embeded content e.g. Tweet or Google Map.
  contentName: string;
}

const YoutubeEmbedConfig: MoetruyenEmbedConfig = {
  contentName: 'Video Youtube',

  insertNode: (editor: LexicalEditor, result: EmbedMatchResult) => {
    editor.dispatchCommand(INSERT_YOUTUBE_COMMAND, result.id);
  },

  // Determine if a given URL is a match and return url data.
  parseUrl: async (url: string) => {
    const match =
      /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/.exec(url);

    const id = match ? (match?.[2].length === 11 ? match[2] : null) : null;

    if (id != null) {
      return {
        id,
        url,
      };
    }

    return null;
  },

  type: 'youtube-video',
};

const TiktokEmbedConfig: MoetruyenEmbedConfig = {
  contentName: 'Video Tiktok',

  insertNode: (editor: LexicalEditor, result: EmbedMatchResult) => {
    editor.dispatchCommand(INSERT_TIKTOK_COMMAND, result.id);
  },

  // Determine if a given URL is a match and return url data.
  parseUrl: async (url: string) => {
    const match =
      /^.*https:\/\/(?:m|www)\.tiktok\.com\/.*\b(?:(usr|v|embed|user|video)\/|\?shareId=)(\d+)/.exec(
        url
      );

    const id = match ? (match?.[2].length > 0 ? match[2] : null) : null;

    if (id != null) {
      return {
        id,
        url,
      };
    }

    return null;
  },

  type: 'tiktok-video',
};

const EmbedConfigs = [YoutubeEmbedConfig, TiktokEmbedConfig];

function AutoEmbedMenuItem({
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
  option: AutoEmbedOption;
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
      id={'typeahead-item-' + index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      <span className="text">{option.title}</span>
    </li>
  );
}

function AutoEmbedMenu({
  options,
  selectedItemIndex,
  onOptionClick,
  onOptionMouseEnter,
}: {
  selectedItemIndex: number | null;
  // eslint-disable-next-line no-unused-vars
  onOptionClick: (option: AutoEmbedOption, index: number) => void;
  // eslint-disable-next-line no-unused-vars
  onOptionMouseEnter: (index: number) => void;
  options: Array<AutoEmbedOption>;
}) {
  return (
    <div className="typeahead-popover">
      <ul>
        {options.map((option: AutoEmbedOption, i: number) => (
          <AutoEmbedMenuItem
            index={i}
            isSelected={selectedItemIndex === i}
            onClick={() => onOptionClick(option, i)}
            onMouseEnter={() => onOptionMouseEnter(i)}
            key={option.key}
            option={option}
          />
        ))}
      </ul>
    </div>
  );
}

const getMenuOptions = (
  activeEmbedConfig: MoetruyenEmbedConfig,
  embedFn: () => void,
  dismissFn: () => void
) => {
  return [
    new AutoEmbedOption('Hủy', {
      onSelect: dismissFn,
    }),
    new AutoEmbedOption(`Nhúng ${activeEmbedConfig.contentName}`, {
      onSelect: embedFn,
    }),
  ];
};

export default function AutoEmbedPlugin(): JSX.Element {
  return (
    <>
      <LexicalAutoEmbedPlugin<MoetruyenEmbedConfig>
        embedConfigs={EmbedConfigs}
        onOpenEmbedModalForConfig={AutoEmbedPlugin}
        getMenuOptions={getMenuOptions}
        menuRenderFn={(
          anchorElementRef,
          {
            selectedIndex,
            options,
            selectOptionAndCleanUp,
            setHighlightedIndex,
          }
        ) =>
          anchorElementRef.current
            ? createPortal(
                <div
                  className="typeahead-popover auto-embed-menu"
                  style={{
                    marginLeft: `${anchorElementRef.current.clientWidth / 2}px`,
                    marginTop: `${
                      anchorElementRef.current.clientHeight + 10
                    }px`,
                    width: 'max-content',
                  }}
                >
                  <AutoEmbedMenu
                    options={options}
                    selectedItemIndex={selectedIndex}
                    onOptionClick={(option: AutoEmbedOption, index: number) => {
                      setHighlightedIndex(index);
                      selectOptionAndCleanUp(option);
                    }}
                    onOptionMouseEnter={(index: number) => {
                      setHighlightedIndex(index);
                    }}
                  />
                </div>,
                anchorElementRef.current
              )
            : null
        }
      />
    </>
  );
}
