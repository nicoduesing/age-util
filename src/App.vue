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
      <time :datetime="dateOfBirth">{{ formattedBirthday }}</time
      >.
    </p>
    <template v-if="yearOfBirth >= 1900">
      <h2>Age</h2>
      <ul v-if="result.agesList.length > 0">
        <li v-for="age of result.agesList" :key="age">{{ age }}</li>
      </ul>
      <h2>Celebartions of next 10 years</h2>
      <button @click.prevent="loadPreviousYears++">load before</button>
      <ul v-if="result.celebartions.length > 0" class="timeline">
        <li
          v-for="celebration of result.celebartions"
          :key="
            String(celebration.date) + celebration.amount + celebration.unit
          "
        >
          <div class="day">
            <time :datetime="String(celebration.date)">{{
              celebration.date.toLocaleString(undefined, DATE_FORMAT_OPTIONS)
            }}</time>
          </div>
          You become
          <time
            :datetime="
              String(
                Temporal.Duration.from({
                  [celebration.unit]: celebration.amount,
                }),
              )
            "
            >{{ celebration.amount.toLocaleString() }}
            {{ celebration.unit }}</time
          >
          old.
        </li>
      </ul>
    </template>
    <p v-else-if="dateOfBirth">The date it out of range for living people.</p>
  </form>
</template>

<script setup lang="ts">
import { Temporal } from "temporal-polyfill";
import { ref, computed } from "vue";
import {
  calculateAgesList,
  calculateCelebrations,
  Celebration,
} from "./ageLogic";

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

const yearOfBirth = computed(() =>
  dateOfBirth.value ? Temporal.PlainDate.from(dateOfBirth.value).year : 0,
);
const result = computed(
  (): { agesList: string[]; celebartions: Celebration[] } => {
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
      ).filter(
        (celb) =>
          Temporal.PlainDate.compare(
            celb.date,
            today.add({ years: -1 * loadPreviousYears.value }),
          ) >= 0 && Temporal.PlainDate.compare(celb.date, inTenYears) <= 0,
      ),
    };
  },
);
</script>

<style scoped>
ul {
  padding: 0;
}
li {
  list-style: none;
}
ul.timeline {
  border-left: 1px solid #eee;
  width: 50%;
  margin-left: 50%;
}
ul.timeline li {
  box-sizing: border-box;
  list-style: disc;
  list-style-position: outside;
  list-style-type: "⬤";
  margin-left: 0.54rem;
  color: #eee;
  text-align: left;
  clear: both;
}
ul.timeline li .day {
  box-sizing: border-box;
  width: 100%;
  margin-left: calc(-100% + 1rem);
  padding-right: 3rem;
  float: left;
  text-align: right;
}
</style>
