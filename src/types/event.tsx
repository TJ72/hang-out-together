export interface Event {
  id?: string;
  title: string;
  type: string;
  host: string;
  createdAt: Date;
  location: string;
  main_image?: string;
  members: Array<string>;
  // images: Array<string>;
  // details: string;
  // deadline: Date;
}
