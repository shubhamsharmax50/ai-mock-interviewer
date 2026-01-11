import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Controller, Control, Path, FieldValues } from "react-hook-form"



interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password'|'file'
}
const TextField  =<T extends FieldValues>({
   control ,
    name ,
     label ,
      placeholder ,
       type="text"}: FormFieldProps<T>) => {
  return (
   <FormField
   name={name}
   control={control}  
      render={({ field }) => (
        <FormItem>
<FormLabel className="block text-base font-semibold text-white mb-2">
  {label}
</FormLabel>

          <FormControl>
          <Input
  {...field}
  placeholder={placeholder}
  type={type}
  className="text-white placeholder:text-gray-500"
/>

          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default TextField