import { registerDecorator, } from 'class-validator';
export function IsOnOrAfter(property, validationOptions) {
    return (object, propertyName) => {
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
                validate(value, args) {
                    const [relatedProperty] = args.constraints;
                    const related = args.object[relatedProperty];
                    if (typeof value !== 'string' || typeof related !== 'string')
                        return true;
                    return value >= related;
                },
            },
        });
    };
}
//# sourceMappingURL=is-on-or-after.js.map