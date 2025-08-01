import { useState, useEffect } from "react";

function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler); // Clear timeout on value change
        };
    }, [value, delay]);

    return debouncedValue;
}

export default useDebounce;