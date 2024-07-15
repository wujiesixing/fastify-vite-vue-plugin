export function deepFreeze<T>(object: T) {
  try {
    const propertyNames = Object.getOwnPropertyNames(object);

    for (const name of propertyNames) {
      const value = (object as any)[name];

      if (value && typeof value === "object" && !Object.isFrozen(value)) {
        deepFreeze(value);
      }
    }
  } catch (error) {}

  return Object.freeze(object);
}
