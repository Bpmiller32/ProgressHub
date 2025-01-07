import { ColumnType } from "./ColumnType";

export interface CardType {
  title: string;
  id: string;
  column: ColumnType;
  order: number;
  completed?: boolean;
  createdBy: string;
  lastEditedBy: string;
  lastEditedTime: number; // Unix timestamp in milliseconds
  lastMovedTime: number; // Unix timestamp in milliseconds
  isArchived: boolean;
}
