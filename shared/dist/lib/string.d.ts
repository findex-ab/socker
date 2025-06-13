export type StringWithLength<T extends string = string> = {
    length: number;
    value: T;
};
export declare const stringWithLength: <T extends string = string>(text: T) => StringWithLength<T>;
