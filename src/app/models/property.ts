export interface Property {
  _id?: string;
  title: string;
  location: string;
  pricePerNight: number;
  image: string;
  type: string;
  rating: number;
  description: string;
  // מחקנו את name ו-price כי הם כפילויות של title ו-pricePerNight
}