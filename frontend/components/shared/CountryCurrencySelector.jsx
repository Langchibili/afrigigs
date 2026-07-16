"use client";

/**
 * components/shared/CountryCurrencySelector.jsx
 * Drives localized minimum-bid display + currency symbol. Fetches the
 * Country list (public read) and lets a parent control the selected value.
 */
import { useEffect, useState } from "react";
import { MenuItem, TextField, Typography } from "@mui/material";
import { CountryApi } from "@/lib/endpoints";
import Stack from "@/components/layout/Stack";

export default function CountryCurrencySelector({ value, onChange, showMinBid = false }) {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    CountryApi.list()
      .then((res) => setCountries(res.data ?? []))
      .catch(() => setCountries([]))
      .finally(() => setLoading(false));
  }, []);

  const selected = countries.find((c) => c.id === value);

  return (
    <Stack direction="column" gap={0.75}>
      <TextField
        select
        label="Country"
        value={value ?? ""}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={loading}
        fullWidth
      >
        {countries.map((c) => (
          <MenuItem key={c.id} value={c.id}>
            {c.name}
          </MenuItem>
        ))}
      </TextField>
      {showMinBid && selected?.currency && (
        <Typography variant="caption" color="text.secondary">
          Domestic bid floor: {selected.currency.symbol}
          {selected.currency.minimum_national_bid}
        </Typography>
      )}
    </Stack>
  );
}
