import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { usePreventFileDrop } from './use-prevent-file-drop';

// O jsdom não implementa o DragEvent: o dataTransfer entra à mão num Event comum.
function dispatchDrag(type: 'dragover' | 'drop', types: string[]) {
  const event = new Event(type, { cancelable: true });

  Object.defineProperty(event, 'dataTransfer', { value: { types, dropEffect: 'copy' } });
  window.dispatchEvent(event);

  return event;
}

describe('usePreventFileDrop', () => {
  it.each(['dragover', 'drop'] as const)('stops the browser from opening a file dropped outside an upload area (%s)', (type) => {
    renderHook(() => usePreventFileDrop());

    expect(dispatchDrag(type, ['Files']).defaultPrevented).toBe(true);
  });

  it('leaves text and link drags alone', () => {
    renderHook(() => usePreventFileDrop());

    expect(dispatchDrag('drop', ['text/plain']).defaultPrevented).toBe(false);
  });

  it('stops listening when the page goes away', () => {
    const { unmount } = renderHook(() => usePreventFileDrop());

    unmount();

    expect(dispatchDrag('drop', ['Files']).defaultPrevented).toBe(false);
  });
});
