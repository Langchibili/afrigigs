/**
 * lib/format.js
 * Small formatting helpers shared across components.
 */

export function formatMoney(amount, currency) {
  const symbol = currency?.symbol ?? "";
  const value = Number(amount ?? 0);
  return `${symbol}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatUsd(amount) {
  return `$${Number(amount ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function timeAgo(dateString) {
  if (!dateString) return "";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

export function initials(name) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function trustLevel(trustScoreYes) {
  if (trustScoreYes >= 10) return "high";
  if (trustScoreYes >= 3) return "medium";
  return "low";
}

export function statusLabel(status) {
  return status
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}
