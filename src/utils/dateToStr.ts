interface DateToStrOptions {
  ymd?: boolean;
  hms?: boolean;
  year?: boolean;
  second?: boolean;
  ymdSplit?: string;
  hmsSplit?: string;
  ymdHmsSplit?: string;
}

const dateToStr = (date: Date, options: DateToStrOptions = {}) => {
  const {
    ymd = true,
    hms = true,
    year = true,
    second = true,
    ymdSplit = '-',
    hmsSplit = ':',
    ymdHmsSplit = ' ',
  } = options;
  const strs: string[] = [];

  if (ymd) {
    const ymdStrs = [
      (date.getMonth() + 1).toString().padStart(2, '0'),
      date.getDate().toString().padStart(2, '0'),
    ];

    if (year) {
      ymdStrs.unshift(date.getFullYear().toString());
    }

    strs.push(ymdStrs.join(ymdSplit));
  }

  if (hms) {
    const hmsStrs = [
      date.getHours().toString().padStart(2, '0'),
      date.getMinutes().toString().padStart(2, '0'),
    ];

    if (second) {
      hmsStrs.push(date.getSeconds().toString().padStart(2, '0'));
    }

    strs.push(hmsStrs.join(hmsSplit));
  }

  return strs.join(ymdHmsSplit);
};

export default dateToStr;
