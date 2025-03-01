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
            try {
                for (const middleware of middlewares) {
                    await middleware(args[0]); // Middleware dijalankan lebih dulu
                }

                // Jika semua middleware berhasil, jalankan method utama
                return originalMethod.apply(this, args);
            } catch (error) {
                console.log(`Middleware blocked execution: ${(error as Error).message}`);
            }
        };

        return descriptor; // Return the modified descriptor
    };
}
