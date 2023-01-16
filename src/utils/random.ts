const randomPool: string[] = [];

const createStringList = (st: string | number, ed: string | number): string[] => {
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

interface RandomOptions {
  prefix?: string | number;
  length?: number;
  candidates?: (string | number)[];
  candidateStr?: string;
}

const randomStr = (options: RandomOptions = {}): string => {
  const {
    prefix = '',
    length = 6,
    candidates = createStringList('a', 'z')
      .concat(createStringList('A', 'Z'))
      .concat(createStringList(0, 9)),
    candidateStr = candidates.join(''),
  } = options;
  const str: string = Array.from({ length })
    .map(() => candidateStr[Math.floor(candidateStr.length * Math.random())])
    .join('');
  const result = `${prefix}${str}`;

  if (randomPool.includes(result)) {
    return randomStr(options);
  }

  randomPool.push(result);

  return result;
};

export default randomStr;
