import { fract } from "./math";
export const isFloat = (x) => fract(x) > 0.0;
export const isInt = (x) => !isFloat(x);
export const isUint = (x) => isInt(x) && x >= 0;
