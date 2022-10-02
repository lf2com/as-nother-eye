import React from 'react';
import { Link } from 'react-router-dom';

const Welcome = () => (
  <div>
    Hello World
    <Link to="/test">
      <div>
        Test
      </div>
    </Link>
  </div>
);

export default Welcome;
