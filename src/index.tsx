import React, { FunctionComponent } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';

import ConnectionContextProvider from './contexts/ConnectionContext';
import LoggerContextProvider from './contexts/LoggerContext';
import ModalContextProvider from './contexts/ModalContext';

import Test from './Test';

import Camera from './pages/AsCamera';
import Photoer from './pages/AsPhotoer';
import Welcome from './pages/Welcome';

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
    <LoggerContextProvider show={false}>
      <ModalContextProvider>
        <ConnectionContextProvider>
        <BrowserRouter>
          <Routes>
            <Route path="photoer/:targetId" element={<Photoer />} />
            <Route path="camera" element={<Camera />} />
            <Route path="test" element={<Test />} />
            <Route path="*" element={<Welcome />} />
          </Routes>
        </BrowserRouter>
        </ConnectionContextProvider>
      </ModalContextProvider>
    </LoggerContextProvider>
  </AppElem>
);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(<App />);
