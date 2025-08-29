import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

interface PollOptionInputProps {
  value: string
  onChange: (value: string) => void
  onRemove: () => void
  placeholder?: string
}

export function PollOptionInput({ 
  value, 
  onChange, 
  onRemove, 
  placeholder = "Enter option" 
}: PollOptionInputProps) {
  return (
    <div className="flex gap-2">
      <Input 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <Button 
        type="button" 
        variant="ghost" 
        size="icon"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}