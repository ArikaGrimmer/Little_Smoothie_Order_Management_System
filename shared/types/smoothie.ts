export interface SmoothieBase {
  id: string;
  name: string;
  price: number;            // base price
}

export interface SmoothieFruit {
  id: string;
  name: string;
  extraPrice: number;       // add-on price for fruit
}

export interface SmoothieSize {
  id: string;
  name: string;
  multiplier: number;       // for price calculaction: small=1.0, medium=1.2, large=1.5
}

export type SweetnessLevel = "none" | "low" | "regular" | "extra";
export type IceLevel = "none" | "less" | "regular" | "extra";
