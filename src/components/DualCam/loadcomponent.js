import { useEffect, useRef } from 'react';

const loadcomponent = (callback, dependencies, shouldRun) => {
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (shouldRun && !hasRunRef.current) {
      callback();
      hasRunRef.current = true;
    } else if (!shouldRun) {
      hasRunRef.current = false;
    }
  }, [shouldRun, ...dependencies]);
};

export default loadcomponent;
