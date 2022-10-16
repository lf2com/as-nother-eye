import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';

import { useModalContext } from '../../contexts/ModalContext';

const Welcome = () => {
  const { askYesNo } = useModalContext();
  const addModal = useCallback(() => {
    askYesNo(new Date().toISOString());
  }, [askYesNo]);

  return (
    <div>
      Hello World
      <Link to="/test">
        <div>
          Test
        </div>
      </Link>
      <button onClick={addModal}>
        Add Modal
      </button>
    </div>
  );
};

export default Welcome;
