import type { FC } from 'react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';

import OverlayProvider from './contexts/OverlayProvider';
import Catcher from './pages/Catcher';
import Entry from './pages/Entry';
import PeerTest from './pages/PeerTest';
import PeerCatcherTest from './pages/PeerTest/PeerCatcherTest';
import PeerTwinTest from './pages/PeerTest/PeerTwinTest';
import PeerViewerTest from './pages/PeerTest/PeerViewerTest';
import TwinTest from './pages/PeerTest/TwinTest';
import Viewer from './pages/Viewer';

const App: FC = () => (
  <div className="fixed w-full h-full select-none [-webkit-tap-highlight-color:transparent]">
    <OverlayProvider>
      <div className="w-full h-full flex justify-center items-center">
        <HashRouter>
          <Routes>
            <Route path="/" element={<Entry />} />
            <Route path="/twin-test" element={<TwinTest />} />
            <Route path="/peer-twin-test" element={<PeerTwinTest />} />
            <Route path="/peer-catcher-test" element={<PeerCatcherTest />} />
            <Route path="/peer-viewer-test" element={<PeerViewerTest />} />
            <Route path="/peer-test/:id?" element={<PeerTest />} />
            <Route path="/catcher/:id?" element={<Catcher />} />
            <Route path="/viewer/:id?" element={<Viewer />} />
          </Routes>
        </HashRouter>
      </div>
    </OverlayProvider>
  </div>
);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(<App />);
