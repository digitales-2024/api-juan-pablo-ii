import { ApiProperty } from '@nestjs/swagger';
import { Staff } from 'libs/staff/entities/staff.entity';
import { Branch } from 'src/modules/branch/entities/branch.entity';

export class TypeStorage {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  branchId?: string;

  @ApiProperty()
  staffId?: string;

  @ApiProperty()
  isActive?: boolean;
}

export class DetailedTypeStorage extends TypeStorage {
  @ApiProperty({
    type: Branch,
  })
  Branch?: Pick<Branch, 'name'>;

  @ApiProperty({
    type: Staff,
  })
  Staff?: Pick<Staff, 'name'>;
}
