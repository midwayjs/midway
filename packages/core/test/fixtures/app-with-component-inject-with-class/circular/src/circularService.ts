import { Inject, Provide } from "../../../../../src";
import { A } from ".";

@Provide()
export class CircularService {
  @Inject()
  a: A;
}
