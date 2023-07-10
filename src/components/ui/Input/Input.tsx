import styles from "./Input.module.scss";
import React, { useRef } from "react";
import { clsx } from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  setValue: (value: string) => void;
  startIcon?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
}

const Input = ({ value, setValue, startIcon, placeholder, disabled, ...rest }: InputProps) => {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div
      onClick={() => ref.current?.focus()}
      className={clsx(styles.inputWrapper, disabled && styles.disabled)}
    >
      {startIcon && <div className={styles.startIcon}>{startIcon}</div>}
      <input
        ref={ref}
        className={styles.input}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        {...rest}
      />
    </div>
  );
};

export { Input };
