type GetEventHandlers<T extends object> = {
  [E in keyof T as E extends string
    ? // eslint-disable-next-line @typescript-eslint/ban-types
      T[E] extends Function
      ? `on${Capitalize<E>}`
      : never
    : never]: T[E];
};

export default GetEventHandlers;
