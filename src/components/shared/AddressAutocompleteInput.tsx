"use client";

import { useState, useEffect, useRef } from "react";
import { useFormContext, Controller, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/use-debounce";
import { GetAddressSuggestions } from "@/services/addresses.service";
import { cn } from "@/lib/utils";

interface AddressAutocompleteInputProps {
  name: string;
  label: string;
  placeholder?: string;
  suggestionType: "city" | "neighborhood" | "street";
  id?: string;
  className?: string;
}

export function AddressAutocompleteInput({
  name,
  label,
  placeholder,
  suggestionType,
  id,
  className,
}: AddressAutocompleteInputProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const [ suggestions, setSuggestions ] = useState<string[]>([]);
  const [ isOpen, setIsOpen ] = useState(false);
  const [ isLoading, setIsLoading ] = useState(false);
  const [ inputValue, setInputValue ] = useState("");
  const debouncedValue = useDebounce(inputValue, 500);
  const containerRef = useRef<HTMLDivElement>(null);

  const getNestedError = (errors: FieldErrors, path: string) => {
    return path.split(".").reduce((acc, part) => {
      if (acc && typeof acc === "object" && part in acc) {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, errors as unknown);
  };

  const error = getNestedError(errors, name) as { message?: string } | undefined;
  const errorMessage = error?.message;

  useEffect(() => {
    if (debouncedValue && debouncedValue.length >= 2) {
      setIsLoading(true);
      GetAddressSuggestions({ type: suggestionType, search: debouncedValue })
        .then((response) => {
          if (response.data) {
            setSuggestions(response.data);
            setIsOpen(response.data.length > 0);
          } else {
            setSuggestions([]);
            setIsOpen(false);
          }
        })
        .catch(() => {
          setSuggestions([]);
          setIsOpen(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [ debouncedValue, suggestionType ]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Controller
      name={ name }
      control={ control }
      render={ ({ field }) => (
        <div
          className={ cn("space-y-2 relative", className) }
          ref={ containerRef }
        >
          <Label htmlFor={ id }>{label}</Label>
          <Input
            { ...field }
            value={ field.value ?? "" }
            id={ id }
            placeholder={ placeholder }
            className="placeholder:text-muted-foreground/50"
            onChange={ (e) => {
              field.onChange(e.target.value);
              setInputValue(e.target.value);
            } }
            onFocus={ () => {
              if (suggestions.length > 0) {
                setIsOpen(true);
              }
            } }
            autoComplete="nope"
          />
          {isLoading && (
            <div className="absolute right-3 top-9 text-xs text-muted-foreground">
              Buscando...
            </div>
          )}
          {isOpen && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-[200px] overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={ `${suggestion}-${index}` }
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                  onClick={ () => {
                    field.onChange(suggestion);
                    setInputValue(suggestion);
                    setIsOpen(false);
                  } }
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          <div className="min-h-[20px]">
            {typeof errorMessage === "string" && (
              <p className="text-sm font-medium text-destructive">
                {errorMessage}
              </p>
            )}
          </div>
        </div>
      ) }
    />
  );
}
