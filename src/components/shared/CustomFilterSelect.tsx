import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from "@/components/ui/select";
import React from "react";

interface CustomFilterSelectProps extends React.ComponentPropsWithoutRef<typeof Select> {
    items: readonly string[];
    placeholder?: string;
    triggerProps?: React.ComponentPropsWithoutRef<typeof SelectTrigger>;
}

export function CustomFilterSelect({
    items,
    placeholder,
    triggerProps,
    ...selectProps
}: CustomFilterSelectProps) {
    return (
        <Select { ...selectProps }>
            <SelectTrigger { ...triggerProps }>
                <SelectValue placeholder={ placeholder } />
            </SelectTrigger>
            <SelectContent>
                { items.map((item) => (
                    <SelectItem key={ item.toLowerCase() } value={ item.toLowerCase() }>
                        { item }
                    </SelectItem>
                )) }
            </SelectContent>
        </Select>
    );
}
