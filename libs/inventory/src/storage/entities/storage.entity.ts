//import { TypeStorage } from '@inventory/inventory/type-storage/entities/type-storage.entity';
import { TypeStorage } from '@inventory/inventory/type-storage/entities/type-storage.entity';
import { ApiProperty } from '@nestjs/swagger';

export class Storage {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  location?: string;

  @ApiProperty()
  typeStorageId: string;

  @ApiProperty()
  isActive: boolean;
}

export class DetailedStorage extends Storage {
  // @ApiProperty({
  //   type: TypeStorage,
  // })
  // typeStorage: TypeStorage;

  @ApiProperty({
    type: TypeStorage,
  })
  TypeStorage: Pick<TypeStorage, 'name'>;
}
