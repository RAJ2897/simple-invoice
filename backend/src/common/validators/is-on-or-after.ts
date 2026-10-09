import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';

/**
 * Cross-field check for ISO dates: the decorated property must be the same day
 * as, or later than, `property`. Skipped when either side is missing so that
 * the required/format validators can report those problems instead.
 */
export function IsOnOrAfter(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isOnOrAfter',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: {
        message: `${propertyName} must be on or after ${property}`,
        ...validationOptions,
      },
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [relatedProperty] = args.constraints as [string];
          const related = (args.object as Record<string, unknown>)[
            relatedProperty
          ];
          if (typeof value !== 'string' || typeof related !== 'string')
            return true;
          return value >= related;
        },
      },
    });
  };
}
