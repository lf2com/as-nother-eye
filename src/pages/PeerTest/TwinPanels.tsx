import type { FC } from 'react';

interface TwinPanelsProps {
  routeA: string;
  routeB: string;
}

const TwinPanels: FC<TwinPanelsProps> = ({ routeA, routeB }) => (
  <div className="flex">
    {[routeA, routeB].map(route => (
      <div
        key={route}
        className="relative m-[1rem] w-[30vw] h-[calc(30vw*16/10)] border border-black"
      >
        <iframe className="w-full h-full" src={`/#${route}`} />
        <div className="absolute top-0 left-0 -translate-y-full -m-px px-1 bg-black text-white">
          {route}
        </div>
      </div>
    ))}
  </div>
);

export default TwinPanels;
