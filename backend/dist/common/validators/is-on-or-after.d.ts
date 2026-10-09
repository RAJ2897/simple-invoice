import { type ValidationOptions } from 'class-validator';
export declare function IsOnOrAfter(property: string, validationOptions?: ValidationOptions): (object: object, propertyName: string) => void;
