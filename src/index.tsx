import React, { FunctionComponent } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Camera from './pages/Camera';
import Photoer from './pages/Photoer';
import Welcome from './pages/Welcome';
import Test from './Test';

const AppElem = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  font-family: Arial, Helvetica, sans-serif;
`;

const App: FunctionComponent = () => (
  <AppElem>
    Hi
  </AppElem>
);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(<App />);
