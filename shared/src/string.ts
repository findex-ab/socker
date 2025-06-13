export type StringWithLength<T extends string = string> = {
  length: number;
  value: T;
}

export const stringWithLength = <T extends string = string>(text: T): StringWithLength<T> => {
  return {
    value: text,
    length: text.length
  }
}
