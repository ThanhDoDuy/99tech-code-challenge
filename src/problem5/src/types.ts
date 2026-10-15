/** A resource stored in the database. */
export interface Resource {
  id: string;
  name: string;
  category: string;
  description: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}
