import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'INR' | 'CNY' | 'AUD' | 'CAD' | 'CHF' | 'HKD' | 'SGD';

interface Currency {
    code: CurrencyCode;
    symbol: string;
    rate: number; // Exchange rate relative to USD
    locale: string;
}

const currencies: Record<CurrencyCode, Currency> = {
    USD: { code: 'USD', symbol: '$', rate: 1, locale: 'en-US' },
    EUR: { code: 'EUR', symbol: '€', rate: 0.96, locale: 'de-DE' },
    GBP: { code: 'GBP', symbol: '£', rate: 0.83, locale: 'en-GB' },
    JPY: { code: 'JPY', symbol: '¥', rate: 158.0, locale: 'ja-JP' },
    INR: { code: 'INR', symbol: '₹', rate: 87.5, locale: 'en-IN' }, // Updated rate
    CNY: { code: 'CNY', symbol: '¥', rate: 7.30, locale: 'zh-CN' },
    AUD: { code: 'AUD', symbol: 'A$', rate: 1.58, locale: 'en-AU' },
    CAD: { code: 'CAD', symbol: 'C$', rate: 1.40, locale: 'en-CA' },
    CHF: { code: 'CHF', symbol: 'Fr', rate: 0.92, locale: 'de-CH' },
    HKD: { code: 'HKD', symbol: 'HK$', rate: 7.85, locale: 'zh-HK' },
    SGD: { code: 'SGD', symbol: 'S$', rate: 1.38, locale: 'en-SG' },
};

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (code: CurrencyCode) => void;
    formatCurrency: (value: number) => string;
    availableCurrencies: Currency[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    // Hardcode currency to INR
    const currency: Currency = { code: 'INR', symbol: '₹', rate: 87.5, locale: 'en-IN' };

    const setCurrency = useCallback((code: CurrencyCode) => {
        // No-op: Currency is locked to INR
        console.warn('Currency is locked to INR');
    }, []);

    const formatCurrency = useCallback((value: number) => {
        const convertedValue = value * currency.rate;
        return new Intl.NumberFormat(currency.locale, {
            style: 'currency',
            currency: currency.code,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(convertedValue);
    }, [currency]);

    const availableCurrencies = useMemo(() => Object.values(currencies), []);

    const value = useMemo(() => ({
        currency,
        setCurrency,
        formatCurrency,
        availableCurrencies,
    }), [currency, setCurrency, formatCurrency, availableCurrencies]);

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
}
