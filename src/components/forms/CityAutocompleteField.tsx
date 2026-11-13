"use client";

import { useId, useState, type KeyboardEvent, type Ref } from "react";
import { FormFieldError } from "@/components/forms/FormFieldError";
import { filterIndianCities, type IndianCityOption } from "@/constants/indian-cities";
import {
  CITY_INPUT_MAX_LENGTH,
  normalizeWhitespace,
} from "@/features/registration/registration-schema";
import { cn } from "@/lib/utils/cn";

interface CityAutocompleteFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  inputRef?: Ref<HTMLInputElement>;
  required?: boolean;
  errorMessage?: string;
}

/**
 * Searchable accessible combobox for Andhra Pradesh, Telangana, and pan-India cities.
 * Allows selecting curated suggestions or typing any legitimate multi-word Indian town.
 */
export function CityAutocompleteField({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  inputRef,
  required = false,
  errorMessage,
}: CityAutocompleteFieldProps) {
  const listboxId = useId();
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const suggestions = filterIndianCities(value, 8);
  const showDropdown = isOpen && suggestions.length > 0;
  const describedBy = errorMessage ? `${helperId} ${errorId}` : helperId;

  const commitOption = (option: IndianCityOption) => {
    onChange(option.name);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(0);
        return;
      }
      setActiveIndex((prev) => (prev + 1) % Math.max(suggestions.length, 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(Math.max(suggestions.length - 1, 0));
        return;
      }
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
      return;
    }

    if (event.key === "Enter" && showDropdown && activeIndex >= 0) {
      const selected = suggestions[activeIndex];
      if (selected) {
        event.preventDefault();
        commitOption(selected);
      }
      return;
    }

    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="relative space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
        {required ? (
          <span aria-hidden="true" className="text-destructive">
            {" "}
            *
          </span>
        ) : null}
      </label>

      <input
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showDropdown}
        aria-controls={listboxId}
        aria-activedescendant={
          showDropdown && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
        }
        aria-invalid={errorMessage ? "true" : "false"}
        aria-describedby={describedBy}
        autoComplete="address-level2"
        enterKeyHint="next"
        maxLength={CITY_INPUT_MAX_LENGTH}
        required={required}
        value={value}
        placeholder="Search or enter city / town"
        onFocus={() => setIsOpen(true)}
        onChange={(event) => {
          onChange(event.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onBlur={() => {
          const normalized = normalizeWhitespace(value);
          if (normalized !== value) {
            onChange(normalized);
          }
          setIsOpen(false);
          setActiveIndex(-1);
          onBlur();
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          "min-h-12 w-full rounded-lg border bg-background px-3.5 py-2.5 text-base text-foreground shadow-2xs transition-colors placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          errorMessage ? "border-destructive" : "border-input",
        )}
      />

      {showDropdown ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Indian city suggestions"
          className="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-border bg-card py-1 shadow-lg"
        >
          {suggestions.map((option, index) => {
            const isActive = index === activeIndex;
            return (
              <li
                key={`${option.name}-${option.state}`}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={isActive}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => commitOption(option)}
                className={cn(
                  "flex min-h-11 cursor-pointer items-center justify-between gap-2 px-3.5 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-foreground hover:bg-secondary/60",
                )}
              >
                <span className="font-medium">{option.name}</span>
                <span className="text-xs text-muted-foreground">{option.state}</span>
              </li>
            );
          })}
        </ul>
      ) : null}

      <p id={helperId} className="text-xs leading-relaxed text-muted-foreground">
        Select an AP, Telangana, or Indian city, or type your town.
      </p>

      {errorMessage ? (
        <div id={errorId}>
          <FormFieldError message={errorMessage} />
        </div>
      ) : null}
    </div>
  );
}
