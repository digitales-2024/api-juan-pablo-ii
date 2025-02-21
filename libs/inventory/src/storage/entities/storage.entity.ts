//import { TypeStorage } from '@inventory/inventory/type-storage/entities/type-storage.entity';
import { TypeStorage } from '@inventory/inventory/type-storage/entities/type-storage.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Staff } from 'libs/staff/entities/staff.entity';
import { Branch } from 'src/modules/branch/entities/branch.entity';

export class Storage {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  location?: string;

  @ApiProperty()
  typeStorageId: string;

  @ApiProperty({
    required: false,
  })
  branchId?: string;

  @ApiProperty({
    required: false,
  })
  staffId?: string;

  @ApiProperty()
  isActive?: boolean;
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

  @ApiProperty({
    type: Branch,
  })
  branch?: Pick<Branch, 'name'>;

  @ApiProperty({
    type: Staff,
  })
  staff?: Pick<Staff, 'name' | 'lastName' | 'staffType'>;
}
