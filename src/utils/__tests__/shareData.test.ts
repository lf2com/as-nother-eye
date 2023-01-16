import shareData, { canShare } from '../shareData';

describe('canShare', () => {
  const mockedCanShare = jest.fn();

  jest
    .spyOn(window, 'navigator', 'get')
    .mockImplementation(() => ({
      canShare: mockedCanShare,
    }) as unknown as Navigator);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call navigator.canShare', () => {
    mockedCanShare.mockReturnValue(true);
    canShare({});
    expect(mockedCanShare).toBeCalled();
  });

  it('should return true', () => {
    mockedCanShare.mockReturnValue(true);
    expect(canShare({})).toBe(true);
  });

  it('should return false', () => {
    mockedCanShare.mockReturnValue(false);
    expect(canShare({})).toBe(false);
  });
});

describe('shareData', () => {
  const mockedCanShare = jest.fn();

  jest.doMock('../shareData', () => ({
    ...jest.requireActual('../shareData'),
    canShare: mockedCanShare,
  }));

  afterEach(() => {
    jest.resetModules();
  });

  it('should throw error if can not share', () => {
    mockedCanShare.mockReturnValue(false);
    expect(() => shareData({})).rejects.toThrowError();
  });

  it('should call navigator.share if can share', async () => {
    const mockedShare = jest.fn();

    mockedCanShare.mockReturnValue(true);
    jest
      .spyOn(window, 'navigator', 'get')
      .mockImplementation(() => ({
        share: mockedShare,
        canShare: () => true,
      }) as unknown as Navigator);

    await shareData({});
    expect(mockedShare).toBeCalledTimes(1);
  });
});
