<template>
  <h1>Age utils</h1>
  <p>
    This tool calculates the age in different units and provides information
    about the next celebrations.
  </p>
  <form>
    <h2><label for="birthdate">What is your date of birth?</label></h2>
    <input
      type="date"
      id="birthdate"
      name="birthdate"
      autocomplete="bday"
      min="1900-01-01"
      v-model="dateOfBirth"
    />
    <p v-if="dateOfBirth">
      You are born at
      {{ formattedBirthday }}.
    </p>
    <template v-if="yearOfBirth >= 1900">
      <h2>Age</h2>
      <ul v-if="result.agesList.length > 0">
        <li v-for="age of result.agesList" :key="age">{{ age }}</li>
      </ul>
      <h2>Celebartions of next 10 years</h2>
      <button @click.prevent="loadPreviousYears++">load before</button>
      <ul v-if="result.celebartions.length > 0">
        <li v-for="celebration of result.celebartions" :key="celebration">
          {{ celebration }}
        </li>
      </ul>
    </template>
    <p v-else-if="dateOfBirth">The date it out of range for living people.</p>
  </form>
</template>

<script setup lang="ts">
import { Temporal } from "temporal-polyfill";
import { ref, computed } from "vue";
import { calculateAgesList, calculateCelebrations } from "./ageLogic";

const dateOfBirth = ref<string>("");
const today = ref(new Date());
setInterval(() => {
  today.value = new Date();
}, 3600_000);
const loadPreviousYears = ref<number>(0);

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "short",
  year: "numeric",
  month: "long",
  day: "numeric",
};

const formattedBirthday = computed(() =>
  new Date(dateOfBirth.value).toLocaleDateString(
    undefined,
    DATE_FORMAT_OPTIONS,
  ),
);

const yearOfBirth = computed(
  () => dateOfBirth.value && Temporal.PlainDate.from(dateOfBirth.value).year,
);
const result = computed((): { agesList: string[]; celebartions: string[] } => {
  if (!dateOfBirth.value) {
    return { agesList: [], celebartions: [] };
  }
  const birthDate = Temporal.PlainDate.from(dateOfBirth.value);
  if (birthDate.year < 1900) {
    return { agesList: [], celebartions: [] };
  }
  const today = Temporal.Now.plainDateISO();
  const ageYears = birthDate.until(today, { largestUnit: "years" });
  const inTenYears = today.add({ years: 10 });

  return {
    agesList: calculateAgesList(birthDate, today),
    celebartions: calculateCelebrations(
      birthDate,
      ageYears.years - loadPreviousYears.value,
      ageYears.years + 11,
    )
      .filter(
        (celb) =>
          Temporal.PlainDate.compare(
            celb.date,
            today.add({ years: -1 * loadPreviousYears.value }),
          ) >= 0 && Temporal.PlainDate.compare(celb.date, inTenYears) <= 0,
      )
      .map(
        (celb) =>
          `At ${celb.date.toLocaleString(undefined, DATE_FORMAT_OPTIONS)} you become ${celb.amount.toLocaleString()} ${celb.unit} old.`,
      ),
  };
});
</script>

<style scoped>
ul {
  padding: 0;
}
li {
  list-style: none;
}
</style>
