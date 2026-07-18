export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(`${value}T00:00:00`));

export const nightsBetween = (checkIn: string, checkOut: string) => {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(`${checkIn}T00:00:00`).getTime();
  const end = new Date(`${checkOut}T00:00:00`).getTime();
  return Math.max(0, Math.round((end - start) / 86_400_000));
};

export const todayIso = () => new Date().toISOString().slice(0, 10);
