import { IsArray, IsNotEmpty } from 'class-validator';

export class ReorderDto {
  @IsArray({ message: 'Danh sách orderedIds phải là một mảng' })
  @IsNotEmpty({ message: 'Danh sách orderedIds không được để trống' })
  orderedIds!: (string | number)[];
}
