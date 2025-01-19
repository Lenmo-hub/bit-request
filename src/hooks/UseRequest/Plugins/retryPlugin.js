import { useRef } from 'react';

const retryPlugin = (fetchInstance, { retryInterval, retryCount }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const timerRef = useRef();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const countRef = useRef(0);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const triggerByRetry = useRef(false);

  if (!retryCount) {
    return {};
  }

  return {
    onBefore: () => {
      if (!triggerByRetry.current) {
        countRef.current = 0;
      }
      triggerByRetry.current = false;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
    onSuccess: () => {
      countRef.current = 0;
    },
    onError: () => {
      countRef.current += 1;
      if (retryCount === -1 || countRef.current <= retryCount) {
        // Exponential backoff
        const timeout =
          retryInterval ?? Math.min(1000 * 2 ** countRef.current, 30000);
        timerRef.current = setTimeout(() => {
          triggerByRetry.current = true;
          fetchInstance.refresh();
        }, timeout);
      } else {
        countRef.current = 0;
      }
    },
    onCancel: () => {
      countRef.current = 0;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
  };
};

export default retryPlugin;
