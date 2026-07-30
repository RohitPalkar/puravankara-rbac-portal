import type { DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import type { Dayjs } from 'dayjs';

import { Controller, useFormContext } from 'react-hook-form';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import dayjs from 'dayjs';

type Props = Omit<DatePickerProps<Dayjs>, 'value' | 'onChange'> & {
  name: string;
  helperText?: string;
};

export function RHFDatePicker({ name, helperText, ...other }: Props) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <DatePicker
          {...field}
          value={field.value ? dayjs(field.value) : null}
          onChange={(newValue) => field.onChange(newValue ? newValue.toISOString() : null)}
          slotProps={{
            textField: {
              fullWidth: true,
              error: !!error,
              helperText: error?.message ?? helperText,
            },
          }}
          {...other}
        />
      )}
    />
  );
}
