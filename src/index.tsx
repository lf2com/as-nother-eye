import React, { FunctionComponent } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';

import ConnectionContextProvider from '@/contexts/ConnectionContext';
import LoggerContextProvider from '@/contexts/LoggerContext';
import ModalContextProvider from '@/contexts/ModalContext';

import Camera from '@/pages/AsCamera';
import Photoer from '@/pages/AsPhotoer';
import Test from '@/pages/Test';
import Welcome from '@/pages/Welcome';

import styles from './styles.module.scss';

const App: FunctionComponent = () => (
  <div className={styles.app}>
    <LoggerContextProvider show={false}>
      <ModalContextProvider>
        <ConnectionContextProvider>
          <HashRouter>
            <Routes>
              <Route path="/photoer/:targetId" element={<Photoer />} />
              <Route path="/photoer" element={<Photoer />} />
              <Route path="/camera/:targetId" element={<Camera />} />
              <Route path="/camera" element={<Camera />} />
              <Route path="/test" element={<Test />} />
              <Route path="/" element={<Welcome />} />
            </Routes>
          </HashRouter>
        </ConnectionContextProvider>
      </ModalContextProvider>
    </LoggerContextProvider>
  </div>
);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(<App />);
