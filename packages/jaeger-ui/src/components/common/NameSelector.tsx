// Copyright (c) 2019 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as React from 'react';
import { Popover } from 'antd';
import cx from 'classnames';
import { IoChevronDown, IoClose } from 'react-icons/io5';

import BreakableText from './BreakableText';
import FilteredList from './FilteredList';

import './NameSelector.css';

type TOptional = {
  clearValue: () => void;
  required?: false;
};

type TRequired = {
  clearValue?: never;
  required: true;
};

type TProps = {
  label: string;
  placeholder?: boolean | string;
  options: string[];
  value: string | null;
  setValue: (value: string) => void;
} & (TOptional | TRequired);

type TState = {
  popoverVisible: boolean;
};

export const DEFAULT_PLACEHOLDER = 'Select a value…';

export default class NameSelector extends React.PureComponent<TProps, TState> {
  listRef: React.RefObject<FilteredList> = React.createRef();
  state: TState = { popoverVisible: false };

  componentDidUpdate() {
    if (this.listRef.current && this.state.popoverVisible) {
      this.listRef.current.focusInput();
    }
  }

  private changeVisible(popoverVisible: boolean) {
    this.setState({ popoverVisible });

    // Defer registering a click handler to hide the selector popover
    // to avoid handling the click event that triggered opening the popover itself.
    setTimeout(() => {
      if (popoverVisible) {
        window.document.body.addEventListener('click', this.onBodyClicked);
      } else {
        window.document.body.removeEventListener('click', this.onBodyClicked);
      }
    });
  }

  private clearValue = (evt: React.MouseEvent) => {
    if (this.props.required) throw new Error('Cannot clear value of required NameSelector');

    evt.stopPropagation();
    this.props.clearValue();
  };

  setValue = (value: string) => {
    this.props.setValue(value);
    this.changeVisible(false);
  };

  private onBodyClicked = () => {
    if (this.listRef.current && !this.listRef.current.isMouseWithin()) {
      this.changeVisible(false);
    }
  };

  onFilterCancelled = () => {
    this.changeVisible(false);
  };

  onPopoverVisibleChanged = (popoverVisible: boolean) => {
    this.changeVisible(popoverVisible);
  };

  render() {
    const { label, options, placeholder = false, required = false, value } = this.props;
    const { popoverVisible } = this.state;

    const rootCls = cx('NameSelector', {
      'is-active': popoverVisible,
      'is-invalid': required && !value,
    });
    let useLabel = true;
    let text = value || '';
    if (!value && placeholder) {
      useLabel = false;
      text = typeof placeholder === 'string' ? placeholder : DEFAULT_PLACEHOLDER;
    }
    return (
      <Popover
        classNames={{ root: 'NameSelector--overlay u-rm-popover-content-padding' }}
        onOpenChange={this.onPopoverVisibleChanged}
        placement="bottomLeft"
        content={
          <FilteredList
            ref={this.listRef}
            cancel={this.onFilterCancelled}
            options={options}
            value={value}
            setValue={this.setValue}
          />
        }
        trigger="click"
        open={popoverVisible}
      >
        <h2 className={rootCls}>
          {useLabel && <span className="NameSelector--label">{label}:</span>}
          <BreakableText className="NameSelector--value" text={text} />
          <IoChevronDown className="NameSelector--chevron" />
          {!required && value && (
            <IoClose
              className="NameSelector--clearIcon"
              onClick={this.clearValue}
              data-testid="name-selector-clear"
            />
          )}
        </h2>
      </Popover>
    );
  }
}
