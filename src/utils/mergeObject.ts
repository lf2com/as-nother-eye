type IterableObject = Record<string, unknown>;

const mergeObject = <A extends IterableObject, B extends IterableObject>(
  a: A,
  refB?: B
): A & B => {
  const result: IterableObject = {};
  const b: IterableObject = refB ?? {};

  Object.keys(a)
    .concat(Object.keys(b))
    .filter((key, index, list) => list.indexOf(key) === index)
    .forEach(key => {
      const valA = a[key];
      const valB = b[key];

      if (typeof valB === 'object') {
        if (typeof valA === 'object') {
          result[key] = mergeObject(
            valA as IterableObject,
            valB as IterableObject
          );
        } else {
          result[key] = mergeObject(valB as IterableObject);
        }
      } else if (Object.prototype.hasOwnProperty.call(b, key)) {
        result[key] = valB;
      } else {
        result[key] = valA;
      }
    });

  return result as A & B;
};

export default mergeObject;
