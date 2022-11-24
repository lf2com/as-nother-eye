const createRoutePath = (path: string) => {
  const { pathname } = globalThis.location;

  return `${pathname.replace(/\/$/, '')}/#/${path.replace(/^\//, '')}`;
};

export default createRoutePath;
