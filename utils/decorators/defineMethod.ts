import type { Context } from "grammy";

type Middleware = (c: Context) => Promise<void>; // Define the type for middleware functions

type Props = {
    middlewares: Middleware[]; // Use the Middleware type
};

export function defineMethod({ middlewares }: Props) {
    return function (
        target: any, // The target class
        propertyKey: string, // The property key (method name)
        descriptor: PropertyDescriptor // The property descriptor
    ): PropertyDescriptor {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            // Assuming the first argument is what the middleware needs
            for (const middleware of middlewares) {
                await middleware(args[0]); // Call the middleware with the context
            }

            // Call the original method
            return originalMethod.apply(this, args);
        };

        return descriptor; // Return the modified descriptor
    };
}
