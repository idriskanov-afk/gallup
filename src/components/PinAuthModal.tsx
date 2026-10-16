"use client";

import { useState, useEffect } from "react";
import { Lock, ShieldCheck, AlertCircle, ArrowRight } from "lucide-react";

interface PinAuthModalProps {
  onSuccess: (country: "uz" | "kz") => void;
  defaultCountry?: "uz" | "kz";
}

export function PinAuthModal({ onSuccess, defaultCountry = "kz" }: PinAuthModalProps) {
  const [pin, setPin] = useState("");
  const [country, setCountry] = useState<"uz" | "kz">(defaultCountry);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);
      if (nextPin.length === 4) {
        verifyPin(nextPin, country);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin("");
    setError(false);
  };

  const verifyPin = (enteredPin: string, selectedCountry: "uz" | "kz") => {
    // Requirements:
    // Уз : 0035
    // Кз : 0035
    const validPin = "0035";

    if (enteredPin === validPin) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("35_admin_authenticated", "true");
        sessionStorage.setItem("35_admin_country", selectedCountry);
      }
      onSuccess(selectedCountry);
    } else {
      setError(true);
      setErrorMessage("Неверный код доступа");
      setTimeout(() => {
        setPin("");
        setError(false);
      }, 700);
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        handleDigit(e.key);
      } else if (e.key === "Backspace") {
        handleDelete();
      } else if (e.key === "Escape") {
        handleClear();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pin, country]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 flex flex-col items-center text-center">
        {/* Logo & Security Badge */}
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-sm">
            <Lock className="w-8 h-8" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 text-teal-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          HR-Дашборд 35
        </h2>
        <p className="text-xs text-slate-500 mt-1 mb-5">
          Введите 4-значный код доступа для входа в коммерческий архив сотрудников
        </p>

        {/* Country Selector Switch */}
        <div className="w-full grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-6 text-xs font-bold text-slate-700">
          <button
            type="button"
            onClick={() => {
              setCountry("uz");
              setPin("");
              setError(false);
            }}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              country === "uz"
                ? "bg-white text-teal-700 shadow-sm"
                : "hover:text-slate-900"
            }`}
          >
            <span className="text-sm">🇺🇿</span> Узбекистан
          </button>
          <button
            type="button"
            onClick={() => {
              setCountry("kz");
              setPin("");
              setError(false);
            }}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              country === "kz"
                ? "bg-white text-teal-700 shadow-sm"
                : "hover:text-slate-900"
            }`}
          >
            <span className="text-sm">🇰🇿</span> Казахстан
          </button>
        </div>

        {/* PIN 4-Circles Display */}
        <div className={`flex items-center gap-3.5 mb-6 ${error ? "animate-shake" : ""}`}>
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  error
                    ? "bg-rose-500 scale-110"
                    : isFilled
                    ? "bg-teal-600 scale-125 ring-4 ring-teal-100"
                    : "bg-slate-200"
                }`}
              />
            );
          })}
        </div>

        {error && (
          <div className="text-xs text-rose-600 font-semibold mb-3 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> {errorMessage}
          </div>
        )}

        {/* Numeric On-Screen Keypad */}
        <div className="w-full grid grid-cols-3 gap-2.5 max-w-[240px]">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="h-14 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-teal-100 text-slate-800 active:text-teal-900 text-xl font-bold transition flex items-center justify-center shadow-xs"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-14 rounded-2xl text-slate-400 hover:text-slate-600 text-xs font-semibold transition flex items-center justify-center"
          >
            Сброс
          </button>
          <button
            type="button"
            onClick={() => handleDigit("0")}
            className="h-14 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-teal-100 text-slate-800 active:text-teal-900 text-xl font-bold transition flex items-center justify-center shadow-xs"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-14 rounded-2xl text-slate-500 hover:text-slate-700 text-sm font-semibold transition flex items-center justify-center"
          >
            ⌫
          </button>
        </div>

        <p className="text-[11px] text-slate-400 mt-6">
          Закрытый доступ только для уполномоченных сотрудников HR
        </p>
      </div>
    </div>
  );
}
