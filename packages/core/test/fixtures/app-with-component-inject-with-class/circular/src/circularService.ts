import { Inject, Provide } from "@midwayjs/decorator";
import { A } from ".";

@Provide()
export class CircularService {
  @Inject()
  a: A;
}
