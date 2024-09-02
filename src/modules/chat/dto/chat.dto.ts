export class ChatDTO {
  _id: string;
  user: string;
  title: string;
  messages: {
      content: string;
      role: "system" | "user" | "assistant";
  }[];
  hasArchive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
