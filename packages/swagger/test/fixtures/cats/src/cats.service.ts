import { Provide } from '@midwayjs/decorator';
import { CreateCatDto } from './dto/create-cat.dto';
import { Cat } from './entities/cat.entity';

@Provide()
export class CatsService {
  private readonly cats: Cat[] = [];

  create(cat: CreateCatDto): Cat {
    this.cats.push(cat);
    return cat;
  }

  findOne(id: number): Cat {
    return this.cats[id];
  }
}
