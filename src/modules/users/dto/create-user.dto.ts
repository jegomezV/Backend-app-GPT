export class CreateUserDto {
  name: string;
  email: string;
  password: string;
  token?: string;
  confirm?: boolean;
}
