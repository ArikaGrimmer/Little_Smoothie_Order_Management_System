import { SweetnessLevel, IceLevel } from "./smoothie";

export type OrderStatus = 
  | "draft"        // customer editing
  | "queued"       // waiting for operator
  | "blending"     // operator is preparing
  | "done";        // finished

export interface SmoothieOrder {
  id: string;              // MongoDB ObjectId string
  customerId: string;      // reference to Customer

  baseId: string;
  fruitIds: string[];

  sweetness: SweetnessLevel;
  iceLevel: IceLevel;
  sizeId: string;

  extraNote?: string;

  status: OrderStatus;
  price: number;           // always auto-calculated

  createdAt: number;
  updatedAt: number;
}
