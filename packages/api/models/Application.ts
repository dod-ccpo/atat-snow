import { Environment } from "./Environment";

export interface Application {
  name: string;
  description: string;
  environments: Array<Environment>;
}
