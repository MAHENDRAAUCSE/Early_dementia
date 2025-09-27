import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  className,
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-10 border-input bg-background hover:bg-accent hover:text-accent-foreground",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          {date ? (
            <span className="text-foreground">
              {format(date, "MMMM d, yyyy")}
            </span>
          ) : (
            <span>{placeholder}</span>
          )}
          <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 border-b">
          <QuickDateSelect date={date} onDateChange={onDateChange} />
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            onDateChange?.(selectedDate);
            setOpen(false);
          }}
          disabled={(date) =>
            date > new Date() || date < new Date("1900-01-01")
          }
          initialFocus
          defaultMonth={date || new Date(2000, 0)}
        />
      </PopoverContent>
    </Popover>
  );
}

function QuickDateSelect({
  date,
  onDateChange,
}: {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
}) {
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1900 + 1 },
    (_, i) => currentYear - i
  );
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleYearChange = (year: string) => {
    const newDate = new Date();
    newDate.setFullYear(parseInt(year));
    if (date) {
      newDate.setMonth(date.getMonth());
      newDate.setDate(date.getDate());
    }
    onDateChange?.(newDate);
  };

  const handleMonthChange = (month: string) => {
    const monthIndex = months.indexOf(month);
    const newDate = date ? new Date(date) : new Date();
    newDate.setMonth(monthIndex);
    onDateChange?.(newDate);
  };

  return (
    <div className="flex gap-2">
      <Select
        value={date ? months[date.getMonth()] : ""}
        onValueChange={handleMonthChange}
      >
        <SelectTrigger className="w-[120px] h-8">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {months.map((month) => (
            <SelectItem key={month} value={month}>
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select
        value={date ? date.getFullYear().toString() : ""}
        onValueChange={handleYearChange}
      >
        <SelectTrigger className="w-[100px] h-8">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent className="max-h-[200px]">
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface DatePickerWithInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
}

export function DatePickerWithInput({
  value,
  onChange,
  placeholder = "Select date of birth",
  className,
  disabled = false,
  id,
}: DatePickerWithInputProps) {
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  );

  // Update internal date when value prop changes
  React.useEffect(() => {
    if (value) {
      setDate(new Date(value));
    } else {
      setDate(undefined);
    }
  }, [value]);

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      // Format to YYYY-MM-DD for form compatibility
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      onChange?.(formattedDate);
    } else {
      onChange?.("");
    }
  };

  return (
    <div className="relative">
      <DatePicker
        date={date}
        onDateChange={handleDateChange}
        placeholder={placeholder}
        className={cn("min-h-[40px]", className)}
        disabled={disabled}
      />
      {/* Hidden input for form compatibility */}
      <input
        type="hidden"
        id={id}
        value={value || ""}
        readOnly
      />
    </div>
  );
}