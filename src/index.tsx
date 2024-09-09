import type { FC } from 'react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';

import ConnectionContextProvider from '@/contexts/ConnectionContext';
import LoggerContextProvider from '@/contexts/LoggerContext';
import ModalContextProvider from '@/contexts/ModalContext';
import Camera from '@/pages/AsCamera';
import Photoer from '@/pages/AsPhotoer';
import Test from '@/pages/Test';
import Welcome from '@/pages/Welcome';

import OverlayProvider from './contexts/OverlayProvider';
import Entry from './pages/Entry';

const App: FC = () => (
  <div className="w-screen h-screen select-none [-webkit-tap-highlight-color:transparent]">
    <OverlayProvider>
      <div className="w-full h-full flex justify-center items-center">
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
                  {/* <Route path="/" element={<Welcome />} /> */}
                  <Route path="/" element={<Entry />} />
                </Routes>
              </HashRouter>
            </ConnectionContextProvider>
          </ModalContextProvider>
        </LoggerContextProvider>
      </div>
    </OverlayProvider>
  </div>
);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(<App />);
