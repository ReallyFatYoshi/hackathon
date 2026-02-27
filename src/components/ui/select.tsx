import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectProps {
  label?: string
  error?: string
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  options: { value: string; label: string }[]
  disabled?: boolean
  required?: boolean
  id?: string
}

export function Select({
  label,
  error,
  placeholder,
  value,
  onValueChange,
  options,
  disabled,
  required,
  id,
}: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-stone-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectPrimitive.Trigger
          id={inputId}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900',
            'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            !value && 'text-stone-400',
            error && 'border-red-500 focus:ring-red-500'
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className="z-50 min-w-[8rem] overflow-hidden rounded-lg border border-stone-200 bg-white shadow-lg animate-in fade-in-0 zoom-in-95"
            position="popper"
            sideOffset={4}
          >
            <SelectPrimitive.Viewport className="p-1">
              {options.map((opt) => (
                <SelectPrimitive.Item
                  key={opt.value}
                  value={opt.value}
                  className="relative flex w-full cursor-pointer select-none items-center rounded-md py-2 px-3 text-sm text-stone-900 outline-none hover:bg-stone-100 focus:bg-stone-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                  <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
