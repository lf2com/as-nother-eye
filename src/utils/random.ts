const randomSet = new Set<string>();

const createStringList = (
  st: string | number,
  ed: string | number
): string[] => {
  const strSt = `${st}`;
  const strEd = `${ed}`;
  const codeSt = strSt.charCodeAt(0);
  const codeEd = strEd.charCodeAt(strEd.length - 1);
  const candidates: string[] = [];

  for (let code = codeSt; code <= codeEd; code += 1) {
    candidates.push(String.fromCharCode(code));
  }

  return candidates;
};

const STR_CANDIDATES = createStringList('a', 'z')
  .concat(createStringList('A', 'Z'))
  .concat(createStringList(0, 9));

const randomStr = (options?: {
  prefix?: string | number;
  length?: number;
  candidates?: string[];
  ignoreRepeat?: boolean;
}): string => {
  const {
    prefix = '',
    length = 6,
    candidates = STR_CANDIDATES,
    ignoreRepeat = false,
  } = options ?? {};
  const str = Array.from(
    { length },
    () => candidates[(candidates.length * Math.random()) | 0]
  ).join('');
  const result = `${prefix}${str}`;

  if (ignoreRepeat || !randomSet.has(result)) {
    randomSet.add(result);

    return result;
  }

  const next = randomStr({
    ...options,
    ignoreRepeat: true,
  });

  // only try another once
  return next === result ? result : next;
};

export const randomId = () =>
  randomStr({
    prefix: 'ane-',
    length: 6,
  });

export default randomStr;
