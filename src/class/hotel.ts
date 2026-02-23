export class Hotel {
  _id?: string;
  title: string = "";
  description: string = "";
  type: string = "";
  pricePerNight: number = 0;
  maxGuests: number = 0;
  location: string = "";
  images: string[] = []; // מערך של מחרוזות
  rating: number = 5;
  ownerName: string = "";
  ownerEmail: string = "";
  ownerPhone: string = "";
}