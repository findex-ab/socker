import { fract } from "./math";

export const isFloat = (x: number): boolean => fract(x) > 0.0;
export const isInt = (x: number): boolean => !isFloat(x);
export const isUint = (x: number): boolean => isInt(x) && x >= 0;
