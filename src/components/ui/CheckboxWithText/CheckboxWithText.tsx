import styles from "./CheckboxWithText.module.scss";
import { CheckboxDisabledIcon, CheckboxEnabledIcon } from "@/assets";
import { InfoIconWithPopUp } from "@/components/ui/InfoIconWithPopUp/InfoIconWithPopUp";
import { clsx } from "clsx";

interface CheckboxWithTextProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  description: string;
  disabled: boolean;
}

export const CheckboxWithText = ({ label, value, onChange, description, disabled }: CheckboxWithTextProps) => {
  return (
    <div className={clsx(styles.container, disabled && styles.disabled)}>
      <div className={styles.label}>
        {label}
        <InfoIconWithPopUp disabled={disabled} text={description} />
      </div>

      <label style={{ cursor: 'pointer', display: 'inline-block' }}>
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          style={{ display: 'none' }}
          disabled={disabled}
        />
        {value ? <CheckboxEnabledIcon /> : <CheckboxDisabledIcon />}
      </label>
    </div>
  );
};
