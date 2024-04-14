import { Temporal } from "temporal-polyfill";

const num1to9 = [...Array(9).keys()].map((v) => v + 1);
const num10to99 = [...Array(90).keys()].map((v) => v + 10);

const numbers = [
  ...[...Array(149).keys()].map((v) => v + 1), // 1, 2, 3, ..., 148, 149
  ...[...Array(98).keys()].map((v) => (v + 2) * 100), // 200, 300, 400, ..., 9800, 9900
  ...[...Array(8).keys()].map((v) => (v + 2) * 111), // 222, 333, 444, ..., 888, 999
  ...[...Array(8).keys()].map((v) => (v + 2) * 100 + 25), // 225, 325, ..., 825, 925
  ...num1to9.map((v) => v * 100 + 50), // 150, 250, ..., 850, 950
  ...num1to9.map((v) => v * 100 + 75), // 175, 275, ..., 875, 975
  404,
  911,
  ...num1to9.map((v) => v * 1_111), // 1_111, 2_222, 3_333, ..., 8_888, 9_999
  1337,
  ...num10to99.map((v) => v * 1_000), // 10_000, 11_000, ..., 98_000, 99_000
  ...num1to9.map((v) => v * 11_111), // 11_111, 22_222, 33_333, ..., 88_888, 99_999
  ...num10to99.map((v) => v * 10_000), // 100_000, 110_000, ..., 980_000, 990_000
  ...num1to9.map((v) => v * 111_111), // 111_111, 222_222, 333_333, ..., 888_888, 999_999
  ...num10to99.map((v) => v * 100_000), // 1_000_000, 1_100_000, ..., 9_800_000, 9_900_000
  ...num1to9.map((v) => v * 1_111_111), // 1_111_111, 2_222_222, 3_333_333, ..., 8_888_888, 9_999_999
  ...num10to99.map((v) => v * 1_000_000), // 10_000_000, 11_000_000, ..., 98_000_000, 99_000_000
  ...num1to9.map((v) => v * 11_111_111), // 11_111_111, 22_222_222, 33_333_333, ..., 88_888_888, 99_999_999
  ...num10to99.map((v) => v * 10_000_000), // 100_000_000, 110_000_000, ..., 980_000_000, 990_000_000
  ...num1to9.map((v) => v * 111_111_111), // 111_111_111, 222_222_222, 333_333_333, ..., 888_888_888, 999_999_999
  ...[...Array(38).keys()].map((v) => (v + 10) * 100_000_000), // 1_000_000_000, 1_100_000_000, ..., 4_600_000_000, 4_700_000_000
  ...[...Array(4).keys()].map((v) => (v + 1) * 1_111_111_111), // 1_111_111_111, 2_222_222_222, 3_333_333_333, 4_444_444_444
].sort((a, b) => a - b);

export const calculateAgesList = (
  birthDate: Temporal.PlainDate,
  today: Temporal.PlainDate,
): string[] => {
  const years = birthDate.until(today, { largestUnit: "years" });
  const daysOld = birthDate.until(today, { largestUnit: "days" }).days;

  return [
    `You are ${years.years} years, ${years.months} months and ${years.days} days old.`,
    `You are ${birthDate.until(today, { largestUnit: "month" }).months.toLocaleString()} months old.`,
    `You are ${birthDate.until(today, { largestUnit: "week" }).weeks.toLocaleString()} weeks old.`,
    `You are ${birthDate.until(today, { largestUnit: "day" }).days.toLocaleString()} days old.`,
    `You are about ${(daysOld * 24).toLocaleString()} hours old.`,
    `You are about ${(daysOld * 24 * 60).toLocaleString()} minutes old.`,
    `You are about ${(daysOld * 24 * 60 * 60).toLocaleString()} seconds old.`,
  ];
};

const MAX_YEARS = 150;

export const calculateCelebrations = (
  birthDate: Temporal.PlainDate,
  minYears: number,
  maxYears: number,
): { unit: string; amount: number; date: Temporal.PlainDate }[] => {
  if (minYears < 0) {
    throw new Error("minYears must not be negative, but was " + minYears);
  }
  if (maxYears > MAX_YEARS) {
    throw new Error(
      `maxYears must not be greater than ${MAX_YEARS} but was ${maxYears}`,
    );
  }
  if (minYears > maxYears) {
    throw new Error(
      `minYears (${minYears}) must be smaller than maxYears (${maxYears}).`,
    );
  }

  const calculateCelebrationsFor = (unit: string, unitsPerYear: number) =>
    numbers
      .filter(
        (v) => v >= unitsPerYear * minYears && v <= unitsPerYear * maxYears,
      )
      .map((amount) => ({
        unit,
        amount,
        date: birthDate.add({ [unit]: amount }),
      }));

  return [
    ...calculateCelebrationsFor("years", 1),
    ...calculateCelebrationsFor("months", 12),
    ...calculateCelebrationsFor("weeks", 52),
    ...calculateCelebrationsFor("days", 365),
    ...calculateCelebrationsFor("hours", 24 * 365),
    ...calculateCelebrationsFor("minutes", 60 * 24 * 365),
    ...calculateCelebrationsFor("seconds", 3600 * 24 * 365),
  ].sort((a, b) => Temporal.PlainDate.compare(a.date, b.date));
};
